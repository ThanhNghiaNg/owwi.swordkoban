import type { Direction } from "../core/types";

type AssetModules = Record<string, string>;

function sortedAssets(modules: AssetModules): string[] {
  return Object.entries(modules)
    .sort(([left], [right]) => left.localeCompare(right, undefined, { numeric: true }))
    .map(([, asset]) => asset);
}

const floorAssets = sortedAssets(
  import.meta.glob<string>("./game_assets/floor/*.png", {
    eager: true,
    import: "default",
    query: "?url",
  }),
);

const wallAssets = sortedAssets(
  import.meta.glob<string>("./game_assets/wall/*.png", {
    eager: true,
    import: "default",
    query: "?url",
  }),
);

const boxAssets = sortedAssets(
  import.meta.glob<string>("./game_assets/box/*.png", {
    eager: true,
    import: "default",
    query: "?url",
  }),
);

const heroAssets = sortedAssets(
  import.meta.glob<string>("./game_assets/hero/*.png", {
    eager: true,
    import: "default",
    query: "?url",
  }),
);

const gateAssets = sortedAssets(
  import.meta.glob<string>("./game_assets/gates/*.png", {
    eager: true,
    import: "default",
    query: "?url",
  }),
);

const obstacleAssets = sortedAssets(
  import.meta.glob<string>("./game_assets/obstacle/*.png", {
    eager: true,
    import: "default",
    query: "?url",
  }),
);

const effectAssets = sortedAssets(
  import.meta.glob<string>("./game_assets/effects/*.png", {
    eager: true,
    import: "default",
    query: "?url",
  }),
);

const buttonAssets = sortedAssets(
  import.meta.glob<string>("./game_assets/buttons/*.png", {
    eager: true,
    import: "default",
    query: "?url",
  }),
);

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function pickStable(assets: readonly string[], key: string): string {
  const asset = assets[hash(key) % assets.length];
  if (!asset) throw new Error(`No sprite is available for "${key}".`);
  return asset;
}

function requiredAsset(assets: readonly string[], index: number, label: string): string {
  const asset = assets[index];
  if (!asset) throw new Error(`Missing required ${label} sprite at index ${index}.`);
  return asset;
}

// The exported box files are ordered J-Z, then A-I.
const boxLetters = "JKLMNOPQRSTUVWXYZABCDEFGHI";
const boxByLetter = new Map(
  Array.from(boxLetters, (letter, index) => [letter, requiredAsset(boxAssets, index, "box")]),
);

const heroByDirection: Record<Direction, string[]> = {
  down: heroAssets.slice(0, 4),
  up: heroAssets.slice(4, 7),
  left: heroAssets.slice(7, 10),
  right: heroAssets.slice(10, 14),
};

// Full square wall variants work for both the boundary and future internal walls.
const fullWallAssets = [...wallAssets.slice(0, 5), ...wallAssets.slice(30, 36)];

export const gameBackground = new URL("./game_assets/background.png", import.meta.url).href;

export const gameButtons = {
  undo: requiredAsset(buttonAssets, 0, "undo button"),
  reset: requiredAsset(buttonAssets, 1, "reset button"),
  menu: requiredAsset(buttonAssets, 2, "menu button"),
  hint: requiredAsset(buttonAssets, 3, "hint button"),
  home: requiredAsset(buttonAssets, 4, "home button"),
  settings: requiredAsset(buttonAssets, 5, "settings button"),
  soundOn: requiredAsset(buttonAssets, 6, "sound button"),
  soundOff: requiredAsset(buttonAssets, 7, "muted button"),
  play: requiredAsset(buttonAssets, 8, "play button"),
};

export const portalFrames = gateAssets;
export const solvedEffect = requiredAsset(effectAssets, 0, "solved effect");
export const winEffect = requiredAsset(effectAssets, 6, "win effect");

export function floorSprite(levelId: string, row: number, col: number): string {
  return pickStable(floorAssets, `${levelId}:floor:${row}:${col}`);
}

export function wallSprite(levelId: string, row: number, col: number): string {
  return pickStable(fullWallAssets, `${levelId}:wall:${row}:${col}`);
}

export function obstacleSprite(levelId: string, id: string): string {
  return pickStable(obstacleAssets, `${levelId}:${id}`);
}

export function crateSprite(letter: string): string | undefined {
  return boxByLetter.get(letter.toLocaleUpperCase());
}

export function heroSprite(direction: Direction, moveCount: number): string {
  const frames = heroByDirection[direction];
  return requiredAsset(frames, moveCount % frames.length, `${direction} hero`);
}
