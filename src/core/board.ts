import { DIRECTION_VECTORS } from "./directions";
import { isBlockingObject } from "./object-rules";
import type { Crate, Direction, GameState, Goal, Position, StaticBoardObject } from "./types";

export function positionKey(position: Position): string {
  return `${position.row}:${position.col}`;
}

export function samePosition(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

export function addDirection(position: Position, direction: Direction, multiplier = 1): Position {
  const delta = DIRECTION_VECTORS[direction];
  return {
    row: position.row + delta.row * multiplier,
    col: position.col + delta.col * multiplier,
  };
}

export function inBounds(position: Position, rows: number, cols: number): boolean {
  return position.row >= 0 && position.row < rows && position.col >= 0 && position.col < cols;
}

export function crateAt(crates: readonly Crate[], position: Position): Crate | undefined {
  return crates.find((crate) => samePosition(crate.position, position));
}

export function goalAt(goals: readonly Goal[], position: Position): Goal | undefined {
  return goals.find((goal) => samePosition(goal.position, position));
}

export function objectAt(
  objects: readonly StaticBoardObject[],
  position: Position,
): StaticBoardObject | undefined {
  return objects.find((object) => samePosition(object.position, position));
}

export function isStaticBlocked(state: Pick<GameState, "objects" | "rows" | "cols">, position: Position): boolean {
  if (!inBounds(position, state.rows, state.cols)) return true;
  const object = objectAt(state.objects, position);
  return object ? isBlockingObject(object) : false;
}

export function clonePosition(position: Position): Position {
  return { row: position.row, col: position.col };
}

export function cloneCrates(crates: readonly Crate[]): Crate[] {
  return crates.map((crate) => ({
    ...crate,
    position: clonePosition(crate.position),
  }));
}
