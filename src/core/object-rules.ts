import type { StaticBoardObject } from "./types";

function assertNever(value: never): never {
  throw new Error(`Unhandled board object: ${JSON.stringify(value)}`);
}

/**
 * Centralized object collision behavior. Traversable future objects (for
 * example teleport pads) can return false here while keeping their enter-effect
 * logic in a separate pure rule module shared by gameplay and the solver.
 */
export function isBlockingObject(object: StaticBoardObject): boolean {
  switch (object.kind) {
    case "wall":
    case "obstacle":
      return true;
    default:
      return assertNever(object);
  }
}
