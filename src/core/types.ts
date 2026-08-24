export type Direction = "up" | "down" | "left" | "right";

export interface Position {
  row: number;
  col: number;
}

export interface WallObject {
  id: string;
  kind: "wall";
  position: Position;
}

export interface ObstacleObject {
  id: string;
  kind: "obstacle";
  position: Position;
}

/**
 * Extensible discriminated union for static board objects.
 * Future objects (teleports, switches, doors, ice, etc.) should be added here
 * and handled by dedicated rule modules instead of React components.
 */
export type StaticBoardObject = WallObject | ObstacleObject;

export interface Goal {
  id: string;
  index: number;
  letter: string;
  position: Position;
}

export interface Crate {
  id: string;
  letter: string;
  position: Position;
}

export interface LevelDefinition {
  id: string;
  seed: string;
  word: string;
  rows: number;
  cols: number;
  playerStart: Position;
  crates: Crate[];
  goals: Goal[];
  objects: StaticBoardObject[];
  generatedSolution?: Direction[];
  generationAttempts?: number;
}

export type GameStatus = "playing" | "won";

export interface GameState {
  levelId: string;
  word: string;
  rows: number;
  cols: number;
  player: Position;
  crates: Crate[];
  goals: Goal[];
  objects: StaticBoardObject[];
  moves: number;
  pushes: number;
  status: GameStatus;
  lastMessage?: string;
}

export interface GeneratorConfig {
  word: string;
  rows: number;
  cols: number;
  obstacleDensity: number;
  seed: string;
  maxAttempts: number;
  solverNodeLimit: number;
}

export interface MoveResult {
  state: GameState;
  moved: boolean;
  pushed: boolean;
  blockedReason?: "wall" | "crate";
}

export interface SolverResult {
  solved: boolean;
  directions: Direction[];
  exploredNodes: number;
  reason?: "node-limit" | "unsolvable";
}
