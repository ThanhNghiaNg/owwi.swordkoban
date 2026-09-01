# Swordkoban

A Tauri 2 + React + TypeScript + Tailwind CSS word-puzzle game for Windows, macOS, Linux, Android, and iOS.

Production web app: <https://swordkoban.owwi.net>

Instead of ordinary Sokoban goals, each crate carries a letter and the goal row forms a word such as **SWORD**. Crates are never locked: any crate may enter or leave any goal at any time. The only win condition is the final arrangement — every goal must contain the matching letter so the word is spelled correctly.

## Phase 1 included

- Final-arrangement letter Sokoban rules with completely movable crates.
- Seeded procedural map generator.
- Generator controls: word, board size, obstacle density, seed.
- Solver validation before generated maps are accepted.
- Guaranteed solver-checked fallback map.
- 5-player-step hint system using a push-state best-first solver.
- Undo, reset, replay seed, and new random map.
- Keyboard controls: Arrow keys / WASD, `H` hint, `Z` undo, `R` reset.
- Touch D-pad for Android/iOS and small screens.
- Responsive desktop/mobile UI with safe-area support.
- Complete illustrated sprite set for the hero, A–Z crates, animated portals, floors, walls, obstacles, effects, buttons, and scenic background.
- Tauri icons for Windows/macOS/Linux bundling.
- Unit tests for ordered rules, solver, and generator.
- Extensible domain model prepared for future objects such as teleporters.

## Stack

- Tauri 2.x
- React 19 + TypeScript
- Vite
- Tailwind CSS 4.x via the official Vite plugin
- Vitest
- ESLint

## Run the frontend

```bash
npm install
npm run dev
```

Open `http://localhost:1420`.

## Run as a native desktop app

Install the Tauri prerequisites for your OS first: Rust, the platform toolchain, and required system WebView dependencies.

```bash
npm install
npm run tauri:dev
```

Production bundle for the current desktop OS:

```bash
npm run tauri:build
```

Production Tauri builds load the hosted app from `https://swordkoban.owwi.net`. The local Vite server is used only by the development commands.

A Tauri build produces the native bundles available for the OS on which you run it. You do not cross-build all desktop operating systems from a single host.

## Android

Install Android Studio, Android SDK/Platform Tools/Build Tools, NDK, command-line tools, Java, and the Rust Android targets per the Tauri 2 prerequisites.

First initialization on a developer machine:

```bash
npm install
npm run tauri:android:init
```

Then:

```bash
npm run tauri:android:dev
# or
npm run tauri:android:build
```

Tauri generates the Android host project under `src-tauri/gen/android` during initialization. Machine-specific Gradle/build output and `local.properties` are ignored by Git.

## iOS / iPadOS

Apple mobile builds require **macOS with full Xcode**. Install the iOS Rust targets and CocoaPods as described in Tauri's prerequisites.

First initialization on the Mac:

```bash
npm install
npm run tauri:ios:init
```

Then:

```bash
npm run tauri:ios:dev
# or
npm run tauri:ios:build
```

Signing/team configuration is intentionally not committed because it belongs to your Apple Developer account.

## Quality checks

```bash
npm run lint
npm run test
npm run build
```

Or all at once:

```bash
npm run check
```

## Generator behavior

`generateLevel()` builds a candidate board from a seed, then runs the same final-arrangement solver used by hints. Only solved candidates are returned. If the configured retry budget is exhausted, the generator switches to a deterministic open-room fallback and validates that fallback with the solver before returning it.

Current practical limits in the UI are intentionally conservative (1–8 Latin letters, 7–13 rows, up to 15 columns, up to 20% rocks) to keep generation and hints responsive on phones.

## Hint behavior

A Hint returns up to the **next 5 actual movement inputs**, not merely five pushes. The solver uses push-state best-first search plus player reachability flood-fill, so it can reconstruct the walking path between crate pushes.

Phase 2 ad/reward integration can gate the `requestHint()` call without changing solver code.

## Future object extension

See [`ARCHITECTURE.md`](./ARCHITECTURE.md). Teleports should be added as domain objects and resolved by shared pure rules used by both gameplay and solver. Avoid putting behavior in React render components.

## Important platform note

The source tree is one Tauri application that targets all five requested OS families. Native installers/apps must still be compiled with each platform's required SDK/toolchain. In particular, iOS compilation/signing is only available on macOS with Xcode.
