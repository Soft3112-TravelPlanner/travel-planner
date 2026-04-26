# AGENTS.md

## Project Overview

- This repository is the Travel Planner platform for SOFT3112 coursework at Isik University.
- The active application lives in `frontend/project`; `backend/` is still reserved for future server work.
- The frontend is a Vite 8, React 19, TypeScript application using TanStack Router file-based routing, HeroUI, Tailwind CSS v4, Framer Motion, React Leaflet, and Vitest.
- The package manager is `npm`. Frontend commands should be run from `frontend/project`.
- SonarCloud is configured from the repository root through `sonar-project.properties` and `.github/workflows/build.yml`.

## Repository Layout

- `.github/workflows/build.yml` runs the SonarCloud workflow, including frontend install and coverage generation.
- `scripts/` contains the project PowerShell workflow and validation helpers.
- `frontend/project` contains the Vite application.
- `frontend/project/src/routes` contains TanStack Router file routes.
- `frontend/project/src/components` contains shared UI components such as destination cards and modals.
- `frontend/project/src/hooks` contains reusable React hooks.
- `frontend/project/src/routeTree.gen.ts` is generated and must not be edited manually.
- `backend/` is intentionally empty except for `.gitkeep`.

## Working Agreements

- Inspect existing route files, config, and nearby patterns before editing.
- Prefer small, focused changes over broad rewrites.
- Keep the current repo split intact unless there is a strong product or tooling reason to change it.
- Prefer the existing stack before adding dependencies. HeroUI, Tailwind utilities, TanStack Router, and local hooks/components should cover most needs.
- Do not hand-edit generated router files.
- Treat local uncommitted changes as user work unless you made them in the current task.
- When touching GitHub Actions, SonarCloud config, routing, provider setup, or form behavior, call out the risk and verify locally where possible.

## UI And UX Priorities

- Keep the app modern, clean, and portfolio-quality.
- Preserve visual consistency across home, auth, search, favorites, trips, and profile routes.
- Use HeroUI primitives for forms and interactive controls, with Tailwind utilities for layout and composition.
- Protect accessibility in forms and interactive UI: labels, required states, validation messages, keyboard behavior, and accessible names matter.
- Check mobile behavior when editing layouts, especially forms, grids, nav, cards, and modals.
- Avoid adding decorative complexity that does not improve the travel-planning workflow.

## Code Conventions

- Route files follow `export const Route = createFileRoute(...)({ component: RouteComponent })`.
- `__root.tsx` owns the root route and `_app.tsx` owns the shared app shell/provider layer.
- Leaf screens usually live in nested `index.tsx` files under `src/routes/_app`.
- Use the `@/*` path alias for app imports.
- Keep shared UI in `src/components` only when it removes real duplication or clarifies behavior.
- Keep reusable browser or state logic in `src/hooks`.
- TypeScript is strict. Avoid unused locals, unused params, `any`, and loose casting.
- Styling is primarily Tailwind utility classes in JSX, with global setup in `src/styles.css`.
- HeroUI/Tailwind integration lives in `src/hero.ts`; keep that wiring intact.

## Testing And SonarCloud

- Vitest is configured in `frontend/project/vite.config.js`.
- `npm run test` runs the test suite.
- `npm run test:coverage` generates coverage with the V8 provider and writes `coverage/lcov.info`.
- SonarCloud reads coverage from `frontend/project/coverage/lcov.info`.
- The current Sonar coverage focus is testable app logic such as `src/data.ts`, `src/hooks/**/*.ts`, and `src/mutations.ts`; route and UI-heavy files are excluded from coverage calculations.
- The GitHub workflow uses `npm ci --legacy-peer-deps` because the current dependency graph has known peer-version tension around Vite/Tailwind tooling.

## Validation Commands

Run frontend commands from `frontend/project`:

- `npm ci --legacy-peer-deps`
- `npm run test`
- `npm run test:coverage`
- `npm run build`
- `npm run start`
- `npm run serve`

Optional repository-level validation from the repo root:

- `powershell -ExecutionPolicy Bypass -File .\scripts\depoyu-dogrula.ps1`

Notes:

- There is currently no `lint` script.
- There is currently no standalone `typecheck` script; `npm run build` runs `vite build && tsc`.
- Coverage output is ignored through `frontend/project/.gitignore`.

## Definition Of Done

- Routes, layout wrappers, providers, and shared components touched by the change still work together.
- The implementation fits the existing TanStack Router file structure.
- Visual consistency and responsive behavior are preserved or improved.
- Accessibility is not worsened.
- SonarCloud issues are addressed with code changes or clearly explained when configuration is the right fix.
- Relevant validation commands have been run when dependencies are available.
- Generated files and unrelated user changes are left alone.

## Agent Behavior Guidance

- Read before editing, especially `package.json`, route files, shared components/hooks, workflow files, and Sonar config.
- Explain major structural, dependency, CI, or Sonar changes before making them.
- Prefer incremental, reviewable edits.
- If a larger refactor is needed, state a short plan first.
- If git workflow is part of the task, respect the repo PowerShell scripts, hook-enforced commit message format, and protected-branch expectations.
