import { positionKey } from "./board";
import { createGameState } from "./game-rules";
import { createRandom, createSeed, type RandomSource } from "./random";
import { solveGame } from "./solver";
import type {
  Crate,
  GeneratorConfig,
  Goal,
  LevelDefinition,
  ObstacleObject,
  Position,
  StaticBoardObject,
  WallObject,
} from "./types";

export const DEFAULT_GENERATOR_CONFIG: GeneratorConfig = {
  word: "SWORD",
  rows: 9,
  cols: 11,
  obstacleDensity: 0.08,
  seed: "",
  maxAttempts: 80,
  solverNodeLimit: 35_000,
};

export interface GenerateLevelResult {
  level: LevelDefinition;
  usedFallback: boolean;
}

export function sanitizeWord(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 8)
    .toLocaleUpperCase();
}

export function normalizeGeneratorConfig(input: Partial<GeneratorConfig>): GeneratorConfig {
  const word = sanitizeWord(input.word ?? DEFAULT_GENERATOR_CONFIG.word) || DEFAULT_GENERATOR_CONFIG.word;
  const minCols = word.length + 4;
  return {
    word,
    rows: Math.max(7, Math.min(13, Math.round(input.rows ?? DEFAULT_GENERATOR_CONFIG.rows))),
    cols: Math.max(minCols, Math.min(15, Math.round(input.cols ?? DEFAULT_GENERATOR_CONFIG.cols))),
    obstacleDensity: Math.max(0, Math.min(0.2, input.obstacleDensity ?? DEFAULT_GENERATOR_CONFIG.obstacleDensity)),
    seed: (input.seed ?? "").trim(),
    maxAttempts: Math.max(1, Math.min(200, Math.round(input.maxAttempts ?? DEFAULT_GENERATOR_CONFIG.maxAttempts))),
    solverNodeLimit: Math.max(
      5_000,
      Math.min(150_000, Math.round(input.solverNodeLimit ?? DEFAULT_GENERATOR_CONFIG.solverNodeLimit)),
    ),
  };
}

function boundaryWalls(rows: number, cols: number): WallObject[] {
  const walls: WallObject[] = [];
  let id = 0;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (row === 0 || col === 0 || row === rows - 1 || col === cols - 1) {
        walls.push({ id: `wall-${id}`, kind: "wall", position: { row, col } });
        id += 1;
      }
    }
  }
  return walls;
}

function buildGoals(word: string, cols: number, rng?: RandomSource): Goal[] {
  const minStart = 2;
  const maxStart = cols - word.length - 2;
  const centered = Math.floor((cols - word.length) / 2);
  const startCol = rng && maxStart >= minStart ? rng.int(minStart, maxStart + 1) : centered;
  return Array.from(word).map((letter, index) => ({
    id: `goal-${index}`,
    index,
    letter,
    position: { row: 1, col: startCol + index },
  }));
}

function interiorCells(rows: number, cols: number): Position[] {
  const cells: Position[] = [];
  for (let row = 1; row < rows - 1; row += 1) {
    for (let col = 1; col < cols - 1; col += 1) cells.push({ row, col });
  }
  return cells;
}

function chooseObstacles(
  rng: RandomSource,
  rows: number,
  cols: number,
  density: number,
  reserved: Set<string>,
): ObstacleObject[] {
  const candidates = rng.shuffle(
    interiorCells(rows, cols).filter((position) => !reserved.has(positionKey(position))),
  );
  const target = Math.floor(candidates.length * density);
  return candidates.slice(0, target).map((position, index) => ({
    id: `obstacle-${index}`,
    kind: "obstacle" as const,
    position,
  }));
}

function buildRandomCandidate(
  config: GeneratorConfig,
  seed: string,
  attempt: number,
): LevelDefinition {
  const rng = createRandom(`${seed}:attempt:${attempt}`);
  const goals = buildGoals(config.word, config.cols, rng);
  const maxCrateRow = Math.max(3, config.rows - 3);
  const crates: Crate[] = goals.map((goal, index) => ({
    id: `crate-${index}`,
    letter: goal.letter,
    position: {
      row: rng.int(3, maxCrateRow + 1),
      col: goal.position.col,
    },
  }));

  // The generated phase-1 topology reserves a guaranteed navigation spine:
  // row 2 lets the player escape after each upward push, column 1 connects
  // that spine to the lower board, and the bottom interior row is a staging
  // walkway. Each crate gets a clear vertical lane to its goal. Obstacles can
  // freely decorate every other cell, so density still changes the board while
  // solvability remains structurally likely before solver validation.
  const reserved = new Set<string>();
  for (let col = 1; col < config.cols - 1; col += 1) {
    reserved.add(positionKey({ row: 2, col }));
    reserved.add(positionKey({ row: config.rows - 2, col }));
  }
  for (let row = 1; row < config.rows - 1; row += 1) {
    reserved.add(positionKey({ row, col: 1 }));
  }
  for (const goal of goals) {
    for (let row = 1; row < config.rows - 1; row += 1) {
      reserved.add(positionKey({ row, col: goal.position.col }));
    }
  }

  const playerStart: Position = {
    row: config.rows - 2,
    col: rng.int(1, config.cols - 1),
  };
  reserved.add(positionKey(playerStart));
  for (const crate of crates) reserved.add(positionKey(crate.position));
  for (const goal of goals) reserved.add(positionKey(goal.position));

  const objects: StaticBoardObject[] = boundaryWalls(config.rows, config.cols);
  objects.push(...chooseObstacles(rng, config.rows, config.cols, config.obstacleDensity, reserved));

  return {
    id: `${seed}-${attempt}`,
    seed,
    word: config.word,
    rows: config.rows,
    cols: config.cols,
    playerStart,
    crates,
    goals,
    objects,
    generationAttempts: attempt + 1,
  };
}

function buildFallbackLevel(config: GeneratorConfig, seed: string): LevelDefinition {
  const goals = buildGoals(config.word, config.cols);
  const crateRow = Math.min(3, config.rows - 3);
  const crates: Crate[] = goals.map((goal, index) => ({
    id: `crate-${index}`,
    letter: goal.letter,
    position: { row: crateRow, col: goal.position.col },
  }));
  const playerStart = {
    row: Math.min(crateRow + 1, config.rows - 2),
    col: Math.max(1, Math.floor(config.cols / 2)),
  };

  return {
    id: `${seed}-fallback`,
    seed,
    word: config.word,
    rows: config.rows,
    cols: config.cols,
    playerStart,
    crates,
    goals,
    objects: boundaryWalls(config.rows, config.cols),
    generationAttempts: config.maxAttempts,
  };
}

/**
 * Generates a random level, validates it with the actual gameplay solver, and
 * retries until a solvable board is found. A deterministic open-room fallback
 * guarantees this API never returns an unplayable level.
 */
export function generateLevel(input: Partial<GeneratorConfig> = {}): GenerateLevelResult {
  const config = normalizeGeneratorConfig(input);
  const seed = config.seed || createSeed();

  for (let attempt = 0; attempt < config.maxAttempts; attempt += 1) {
    const candidate = buildRandomCandidate(config, seed, attempt);
    if (!candidate) continue;

    const solution = solveGame(createGameState(candidate), config.solverNodeLimit);
    if (solution.solved) {
      return {
        level: { ...candidate, generatedSolution: solution.directions },
        usedFallback: false,
      };
    }
  }

  const fallback = buildFallbackLevel(config, seed);
  const fallbackSolution = solveGame(createGameState(fallback), config.solverNodeLimit);
  if (!fallbackSolution.solved) {
    // This should only be reachable after a regression in rules/solver.
    throw new Error("Fallback level unexpectedly failed solver validation.");
  }

  return {
    level: { ...fallback, generatedSolution: fallbackSolution.directions },
    usedFallback: true,
  };
}
