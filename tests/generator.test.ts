import { describe, expect, it } from "vitest";
import { generateLevel } from "../src/core/generator";
import { createGameState, tryMove } from "../src/core/game-rules";

function replayGeneratedSolution() {
  const { level } = generateLevel({
    word: "SWORD",
    rows: 9,
    cols: 11,
    obstacleDensity: 0.08,
    seed: "stable-generator-test",
    maxAttempts: 12,
    solverNodeLimit: 30_000,
  });

  let state = createGameState(level);
  for (const direction of level.generatedSolution ?? []) {
    state = tryMove(state, direction).state;
  }
  return { level, state };
}

describe("procedural generator", () => {
  it("always returns a solver-validated playable level", () => {
    const { level, state } = replayGeneratedSolution();

    expect(level.generatedSolution?.length).toBeGreaterThan(0);
    expect(level.crates).toHaveLength(5);
    expect(level.goals.map((goal) => goal.letter).join("")).toBe("SWORD");
    expect(state.status).toBe("won");
  });
});
