import { addDirection, crateAt, goalAt, isStaticBlocked, positionKey } from "./board";
import { DIRECTIONS, opposite } from "./directions";
import { isSolvedArrangement } from "./game-rules";
import type { Crate, Direction, GameState, Position, SolverResult } from "./types";

interface SearchState {
  player: Position;
  crates: Crate[];
  pushes: number;
}

interface ParentEntry {
  parentKey: string;
  actions: Direction[];
}

interface ReachEntry {
  previousKey?: string;
  direction?: Direction;
}

interface HeapEntry {
  state: SearchState;
  priority: number;
}

class MinHeap {
  private readonly items: HeapEntry[] = [];

  get size(): number {
    return this.items.length;
  }

  push(entry: HeapEntry): void {
    this.items.push(entry);
    let index = this.items.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      const parentEntry = this.items[parent];
      const currentEntry = this.items[index];
      if (!parentEntry || !currentEntry || parentEntry.priority <= currentEntry.priority) break;
      [this.items[parent], this.items[index]] = [currentEntry, parentEntry];
      index = parent;
    }
  }

  pop(): HeapEntry | undefined {
    const first = this.items[0];
    const last = this.items.pop();
    if (!first) return undefined;
    if (!last || this.items.length === 0) return first;

    this.items[0] = last;
    let index = 0;
    while (true) {
      const left = index * 2 + 1;
      const right = left + 1;
      let smallest = index;
      const smallestEntry = this.items[smallest];
      const leftEntry = this.items[left];
      const rightEntry = this.items[right];

      if (leftEntry && smallestEntry && leftEntry.priority < smallestEntry.priority) smallest = left;
      const candidate = this.items[smallest];
      if (rightEntry && candidate && rightEntry.priority < candidate.priority) smallest = right;
      if (smallest === index) break;

      const current = this.items[index];
      const swap = this.items[smallest];
      if (!current || !swap) break;
      [this.items[index], this.items[smallest]] = [swap, current];
      index = smallest;
    }
    return first;
  }
}

function searchStateKey(state: SearchState): string {
  const crates = [...state.crates]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((crate) => `${crate.id}@${positionKey(crate.position)}`)
    .join("|");
  return `${positionKey(state.player)}#${crates}`;
}

function manhattan(a: Position, b: Position): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function sameLetter(a: string, b: string): boolean {
  return a.toLocaleUpperCase() === b.toLocaleUpperCase();
}

function heuristic(game: GameState, state: SearchState): number {
  let estimate = 0;
  let matchedGoals = 0;

  for (const goal of game.goals) {
    const occupyingCrate = crateAt(state.crates, goal.position);
    if (occupyingCrate && sameLetter(occupyingCrate.letter, goal.letter)) {
      matchedGoals += 1;
      continue;
    }

    const distances = state.crates
      .filter((crate) => sameLetter(crate.letter, goal.letter))
      .map((crate) => manhattan(crate.position, goal.position));
    estimate += distances.length > 0 ? Math.min(...distances) : 100;
  }

  // Correct placements are strongly preferred but never locked. The solver is
  // free to move a correctly placed crate again when that is required to solve
  // the board.
  return estimate + state.pushes * 0.15 - matchedGoals * 120;
}

function isSolved(state: SearchState, game: GameState): boolean {
  return isSolvedArrangement(state.crates, game.goals);
}

function isBlockedForPlayer(game: GameState, crates: readonly Crate[], position: Position): boolean {
  return isStaticBlocked(game, position) || crateAt(crates, position) !== undefined;
}

function computeReachability(game: GameState, state: SearchState): Map<string, ReachEntry> {
  const startKey = positionKey(state.player);
  const reached = new Map<string, ReachEntry>([[startKey, {}]]);
  const queue: Position[] = [{ ...state.player }];
  let head = 0;

  while (head < queue.length) {
    const current = queue[head];
    head += 1;
    if (!current) continue;

    for (const direction of DIRECTIONS) {
      const next = addDirection(current, direction);
      const key = positionKey(next);
      if (reached.has(key) || isBlockedForPlayer(game, state.crates, next)) continue;
      reached.set(key, { previousKey: positionKey(current), direction });
      queue.push(next);
    }
  }

  return reached;
}

function pathTo(reached: Map<string, ReachEntry>, target: Position): Direction[] | undefined {
  const targetKey = positionKey(target);
  if (!reached.has(targetKey)) return undefined;

  const reversed: Direction[] = [];
  let cursor = targetKey;
  while (true) {
    const entry = reached.get(cursor);
    if (!entry || entry.previousKey === undefined || entry.direction === undefined) break;
    reversed.push(entry.direction);
    cursor = entry.previousKey;
  }
  return reversed.reverse();
}

function isDeadCorner(game: GameState, crate: Crate, position: Position): boolean {
  const goal = goalAt(game.goals, position);
  if (goal && sameLetter(goal.letter, crate.letter)) return false;

  const blocked = (direction: Direction) => isStaticBlocked(game, addDirection(position, direction));
  return (
    (blocked("up") && blocked("left")) ||
    (blocked("up") && blocked("right")) ||
    (blocked("down") && blocked("left")) ||
    (blocked("down") && blocked("right"))
  );
}

function reconstructSolution(
  parents: Map<string, ParentEntry>,
  startKey: string,
  solvedKey: string,
): Direction[] {
  const segments: Direction[][] = [];
  let cursor = solvedKey;

  while (cursor !== startKey) {
    const parent = parents.get(cursor);
    if (!parent) return [];
    segments.push(parent.actions);
    cursor = parent.parentKey;
  }

  return segments.reverse().flat();
}

/**
 * Push-state best-first solver.
 *
 * Each node flood-fills all cells the player can reach without pushing and
 * branches only on legal pushes. Goals do not impose movement restrictions:
 * any crate may enter or leave any goal. A state is solved only when every
 * goal is occupied by a crate carrying that goal's letter.
 */
export function solveGame(game: GameState, maxNodes = 50_000): SolverResult {
  if (game.status === "won" || isSolvedArrangement(game.crates, game.goals)) {
    return { solved: true, directions: [], exploredNodes: 0 };
  }

  const initial: SearchState = {
    player: { ...game.player },
    crates: game.crates.map((crate) => ({ ...crate, position: { ...crate.position } })),
    pushes: 0,
  };
  const startKey = searchStateKey(initial);
  const frontier = new MinHeap();
  frontier.push({ state: initial, priority: heuristic(game, initial) });
  const visited = new Set<string>();
  const enqueued = new Set<string>([startKey]);
  const parents = new Map<string, ParentEntry>();
  let exploredNodes = 0;

  while (frontier.size > 0) {
    if (exploredNodes >= maxNodes) {
      return { solved: false, directions: [], exploredNodes, reason: "node-limit" };
    }

    const entry = frontier.pop();
    const current = entry?.state;
    if (!current) continue;
    const currentKey = searchStateKey(current);
    if (visited.has(currentKey)) continue;
    visited.add(currentKey);
    exploredNodes += 1;

    const reachable = computeReachability(game, current);

    for (const crate of current.crates) {
      for (const direction of DIRECTIONS) {
        const standBehind = addDirection(crate.position, opposite(direction));
        const walk = pathTo(reachable, standBehind);
        if (!walk) continue;

        const destination = addDirection(crate.position, direction);
        if (isStaticBlocked(game, destination) || crateAt(current.crates, destination)) continue;
        if (isDeadCorner(game, crate, destination)) continue;

        const nextCrates = current.crates.map((candidate) =>
          candidate.id === crate.id
            ? {
                ...candidate,
                position: destination,
              }
            : candidate,
        );
        const next: SearchState = {
          player: { ...crate.position },
          crates: nextCrates,
          pushes: current.pushes + 1,
        };
        const nextKey = searchStateKey(next);
        if (visited.has(nextKey) || enqueued.has(nextKey)) continue;

        enqueued.add(nextKey);
        parents.set(nextKey, {
          parentKey: currentKey,
          actions: [...walk, direction],
        });

        if (isSolved(next, game)) {
          return {
            solved: true,
            directions: reconstructSolution(parents, startKey, nextKey),
            exploredNodes,
          };
        }

        frontier.push({ state: next, priority: heuristic(game, next) + walk.length * 0.01 });
      }
    }
  }

  return { solved: false, directions: [], exploredNodes, reason: "unsolvable" };
}
