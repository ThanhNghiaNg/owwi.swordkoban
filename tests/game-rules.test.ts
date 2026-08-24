import { describe, expect, it } from "vitest";
import { createGameState, tryMove } from "../src/core/game-rules";
import type { LevelDefinition } from "../src/core/types";

function level(overrides: Partial<LevelDefinition> = {}): LevelDefinition {
  return {
    id: "test",
    seed: "test",
    word: "AB",
    rows: 5,
    cols: 7,
    playerStart: { row: 2, col: 1 },
    crates: [
      { id: "crate-a", letter: "A", position: { row: 2, col: 2 } },
      { id: "crate-b", letter: "B", position: { row: 3, col: 4 } },
    ],
    goals: [
      { id: "goal-a", index: 0, letter: "A", position: { row: 1, col: 1 } },
      { id: "goal-b", index: 1, letter: "B", position: { row: 2, col: 3 } },
    ],
    objects: [],
    ...overrides,
  };
}

describe("free-placement word rules", () => {
  it("allows a crate to enter another letter's goal", () => {
    const state = createGameState(level());
    const result = tryMove(state, "right");

    expect(result.moved).toBe(true);
    expect(result.pushed).toBe(true);
    expect(result.state.crates.find((crate) => crate.id === "crate-a")?.position).toEqual({ row: 2, col: 3 });
    expect(result.state.status).toBe("playing");
  });

  it("does not lock a correctly placed crate", () => {
    let state = createGameState(
      level({
        goals: [
          { id: "goal-a", index: 0, letter: "A", position: { row: 2, col: 3 } },
          { id: "goal-b", index: 1, letter: "B", position: { row: 1, col: 4 } },
        ],
      }),
    );

    state = tryMove(state, "right").state;
    expect(state.status).toBe("playing");
    expect(state.crates.find((crate) => crate.id === "crate-a")?.position).toEqual({ row: 2, col: 3 });

    const movedOffGoal = tryMove(state, "right");
    expect(movedOffGoal.moved).toBe(true);
    expect(movedOffGoal.state.crates.find((crate) => crate.id === "crate-a")?.position).toEqual({ row: 2, col: 4 });
  });

  it("wins only when every goal contains the matching letter", () => {
    const unsolved = createGameState(
      level({
        playerStart: { row: 3, col: 1 },
        crates: [
          { id: "crate-a", letter: "A", position: { row: 1, col: 2 } },
          { id: "crate-b", letter: "B", position: { row: 1, col: 1 } },
        ],
        goals: [
          { id: "goal-a", index: 0, letter: "A", position: { row: 1, col: 1 } },
          { id: "goal-b", index: 1, letter: "B", position: { row: 1, col: 2 } },
        ],
      }),
    );
    expect(unsolved.status).toBe("playing");

    const solved = createGameState(
      level({
        playerStart: { row: 3, col: 1 },
        crates: [
          { id: "crate-a", letter: "A", position: { row: 1, col: 1 } },
          { id: "crate-b", letter: "B", position: { row: 1, col: 2 } },
        ],
        goals: [
          { id: "goal-a", index: 0, letter: "A", position: { row: 1, col: 1 } },
          { id: "goal-b", index: 1, letter: "B", position: { row: 1, col: 2 } },
        ],
      }),
    );
    expect(solved.status).toBe("won");
  });
});
