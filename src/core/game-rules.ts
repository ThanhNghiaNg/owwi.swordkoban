import { addDirection, crateAt, goalAt, isStaticBlocked } from "./board";
import type { Crate, Direction, GameState, Goal, LevelDefinition, MoveResult } from "./types";

function sameLetter(a: string, b: string): boolean {
  return a.toLocaleUpperCase() === b.toLocaleUpperCase();
}

export function isGoalSatisfied(goal: Goal, crates: readonly Crate[]): boolean {
  const crate = crateAt(crates, goal.position);
  return crate !== undefined && sameLetter(crate.letter, goal.letter);
}

export function countSatisfiedGoals(crates: readonly Crate[], goals: readonly Goal[]): number {
  return goals.reduce((count, goal) => count + (isGoalSatisfied(goal, crates) ? 1 : 0), 0);
}

export function isSolvedArrangement(crates: readonly Crate[], goals: readonly Goal[]): boolean {
  return goals.length > 0 && goals.every((goal) => isGoalSatisfied(goal, crates));
}

export function createGameState(level: LevelDefinition): GameState {
  const crates = level.crates.map((crate) => ({ ...crate, position: { ...crate.position } }));
  const goals = level.goals.map((goal) => ({ ...goal, position: { ...goal.position } }));

  return {
    levelId: level.id,
    word: level.word,
    rows: level.rows,
    cols: level.cols,
    player: { ...level.playerStart },
    crates,
    goals,
    objects: level.objects.map((object) => ({ ...object, position: { ...object.position } })),
    moves: 0,
    pushes: 0,
    status: isSolvedArrangement(crates, goals) ? "won" : "playing",
  };
}

export function tryMove(state: GameState, direction: Direction): MoveResult {
  if (state.status === "won") {
    return { state, moved: false, pushed: false };
  }

  const playerDestination = addDirection(state.player, direction);
  if (isStaticBlocked(state, playerDestination)) {
    return {
      state: { ...state, lastMessage: "Lối đi đã bị chặn." },
      moved: false,
      pushed: false,
      blockedReason: "wall",
    };
  }

  const crate = crateAt(state.crates, playerDestination);
  if (!crate) {
    return {
      state: {
        ...state,
        player: playerDestination,
        moves: state.moves + 1,
        lastMessage: undefined,
      },
      moved: true,
      pushed: false,
    };
  }

  const crateDestination = addDirection(crate.position, direction);
  if (isStaticBlocked(state, crateDestination) || crateAt(state.crates, crateDestination)) {
    return {
      state: { ...state, lastMessage: "Không thể đẩy thùng theo hướng đó." },
      moved: false,
      pushed: false,
      blockedReason: "crate",
    };
  }

  // Goals never block or lock crates. A crate may enter any goal, leave any
  // goal, or temporarily occupy the wrong goal. Only the final arrangement
  // determines whether the puzzle is solved.
  const crates = state.crates.map((candidate) =>
    candidate.id === crate.id
      ? {
          ...candidate,
          position: crateDestination,
        }
      : candidate,
  );
  const won = isSolvedArrangement(crates, state.goals);
  const targetGoal = goalAt(state.goals, crateDestination);
  const placedCorrectly = targetGoal !== undefined && sameLetter(crate.letter, targetGoal.letter);

  return {
    state: {
      ...state,
      player: playerDestination,
      crates,
      moves: state.moves + 1,
      pushes: state.pushes + 1,
      status: won ? "won" : "playing",
      lastMessage: won
        ? `Hoàn thành “${state.word}”!`
        : placedCorrectly
          ? `Chữ ${crate.letter} đã về đúng cổng. Bạn vẫn có thể đẩy thùng ra.`
          : undefined,
    },
    moved: true,
    pushed: true,
  };
}
