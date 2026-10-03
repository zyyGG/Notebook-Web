# Project Guidelines

## Project Structure
- This is a Vue 3, TypeScript, and Vite application. Keep changes within the existing structure unless a feature needs a new module.
- `src/pages` contains routed views; `src/components` contains shared UI; `src/games` contains game implementations and reusable game components; `src/threejs` contains Three.js examples.
- Follow the nearest existing implementation for module boundaries, exports, and Vue component patterns.

## Code Changes
- Read the relevant implementation and its callers before changing behavior. Preserve existing public APIs and game configuration formats unless the task requires a change.
- Keep edits focused. Do not reformat unrelated code or add dependencies for functionality already supported by the project.
- Match the surrounding file's formatting and naming. Keep comments concise and update them when behavior changes.
- For gameplay or rendering changes, consider both interaction behavior and scene/resource lifecycle; type-checking alone does not verify visual behavior.

## Tests and Validation
- Run `npm test` for the Vitest suite when changing behavior covered by tests.
- Run `npm run build` only when the user explicitly asks to build; otherwise, do not execute it.
- Prefer a focused test for the changed behavior when practical, then run the relevant project-level checks.
- For visual changes, run the app with `npm run dev` and verify the affected view in a browser when practical.