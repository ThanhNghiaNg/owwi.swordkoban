# Ordered Sokoban — Architecture

## Design goals

1. Game rules must be testable without React or Tauri.
2. Procedural generation must never knowingly ship an unsolvable map.
3. UI components render state; they do not own business rules.
4. New object types should enter through discriminated domain types and dedicated rule handlers.
5. Desktop keyboard and mobile touch feed the exact same `Direction` actions into the engine.

## Source layout

- `src/core/types.ts` — domain contracts and extensible object union.
- `src/core/game-rules.ts` — one-step movement/push rules plus final-arrangement win validation.
- `src/core/object-rules.ts` — centralized per-object collision behavior for extensibility.
- `src/core/solver.ts` — push-state best-first search; reconstructs exact player inputs.
- `src/core/generator.ts` — seeded generation, solver validation, guaranteed fallback.
- `src/hooks/useOrderedSokoban.ts` — React orchestration: history, undo, reset, hint, keyboard.
- `src/components/*` — presentation and input only.
- `src/assets/*` — phase-1 vector game art.
- `src-tauri/*` — native shell/config; intentionally has no gameplay logic.
- `tests/*` — rules, solver, and generator regression tests.

## Letter-placement rule

Goals never restrict movement and crates are never locked. Any crate may enter any goal, including a goal with a different letter, and any correctly placed crate may later be pushed away again. The game is won only when every goal is simultaneously occupied by a crate whose letter matches that goal. Goal indices define the left-to-right word order; they do not define a required sequence of moves.

## Solver

The solver does not BFS every walking step. For each push-state it flood-fills all cells reachable by the player without moving crates, enumerates legal crate pushes, and stores the walk path plus final push as an edge. This reduces the state space while still producing a sequence of ordinary player inputs for the 5-step hint feature.

The state key is based only on player position and crate positions. Goal completion is derived from the current board arrangement, so there is no sequential progress or locked-crate state to keep in sync.

## Generator

Generation is seeded and repeatable:

1. Create ordered goals spelling the word at a seeded horizontal offset.
2. Randomize each crate’s vertical start distance in its goal lane.
3. Reserve a navigation spine plus one clear push lane per letter.
4. Place random rock obstacles in the remaining cells.
5. Run the real solver and accept only if solved; otherwise retry.
6. If attempts are exhausted, return a deterministic open-room fallback and verify it with the solver before returning.

This guarantees `generateLevel()` never silently returns a known dead map.

## Adding teleporters later

Recommended path:

1. Add `TeleportObject` to the `StaticBoardObject`/board-object domain model (or split into blocking and effect objects when the first traversable object arrives).
2. Add a pure `resolveEnterEffects(state, position)` rule function that resolves chained entry effects.
3. Make both `tryMove` and solver transitions call the same function.
4. Encode teleporter pairing/direction in object props (`pairId`, `mode: "two-way" | "one-way"`, optional facing).
5. Add generator constraints and tests before enabling teleporters in random generation.

Do not implement teleport behavior inside `GameBoard.tsx`; rendering should only reflect the resulting domain state.

## Monetized hint phase later

`requestHint()` is deliberately isolated. An ad gate can wrap this call without changing the solver:

`tap Hint -> ad/reward service -> on reward -> requestHint()`

Keep ad SDK integration in a platform/service layer, not in `solver.ts`.
