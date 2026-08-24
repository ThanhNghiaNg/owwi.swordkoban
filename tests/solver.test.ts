import { describe, expect, it } from "vitest";
import { createGameState, tryMove } from "../src/core/game-rules";
import { solveGame } from "../src/core/solver";
import type { LevelDefinition } from "../src/core/types";

const level: LevelDefinition = {
  id: "solver-open-room",
  seed: "test",
  word: "ABC",
  rows: 7,
  cols: 9,
  playerStart: { row: 4, col: 4 },
  crates: [
    { id: "crate-0", letter: "A", position: { row: 3, col: 3 } },
    { id: "crate-1", letter: "B", position: { row: 3, col: 4 } },
    { id: "crate-2", letter: "C", position: { row: 3, col: 5 } },
  ],
  goals: [
    { id: "goal-0", index: 0, letter: "A", position: { row: 1, col: 3 } },
    { id: "goal-1", index: 1, letter: "B", position: { row: 1, col: 4 } },
    { id: "goal-2", index: 2, letter: "C", position: { row: 1, col: 5 } },
  ],
  objects: [],
};

describe("push-based solver", () => {
  it("returns player inputs that solve the final letter arrangement", () => {
    let state = createGameState(level);
    const result = solveGame(state, 20_000);

    expect(result.solved).toBe(true);
    expect(result.directions.length).toBeGreaterThan(0);

    for (const direction of result.directions) {
      state = tryMove(state, direction).state;
    }
    expect(state.status).toBe("won");
  });
});
