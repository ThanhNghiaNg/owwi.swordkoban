# Validation notes

Validation performed in the build workspace before packaging:

- Parsed every project JSON file successfully.
- Parsed `src-tauri/Cargo.toml` successfully.
- Strict TypeScript type-check of all dependency-free core modules passed.
- Full source/test static TypeScript pass with temporary React/Vitest interface stubs passed (used because the workspace package registry was unavailable).
- Ordered-rule smoke tests passed:
  - future goal rejects a crate;
  - current goal rejects the wrong letter;
  - correct crate locks and advances/wins.
- Solver continuation smoke test passed after consuming the first 5 hint movements.
- Procedural matrix replay: 25 generated levels across 3–8 letter words, multiple dimensions and obstacle densities; all generated solutions replayed to `won`.
- Generator matrix timing in this workspace: ~3.2 ms average, 10 ms maximum for those 25 cases.
- No `node_modules`, `dist`, Rust `target`, `.env`, signing key, keystore, or certificate is included in the packaged source.

## Environment limitations of this validation run

The workspace did not have a Rust toolchain installed, so `cargo check` / native Tauri compilation could not be executed here. The workspace also could not complete `npm install` from the package registry, so the actual Vite bundle command and Vitest package runner could not be executed in this environment.

The project contains standard Tauri 2 source/configuration, platform initialization scripts, tests, and a dependency manifest. Run `npm install && npm run check` on a normal development machine, then `npm run tauri:dev` after installing the official Tauri prerequisites.
