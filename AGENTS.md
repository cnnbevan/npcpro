# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains the React client; pages live in `src/pages`, reusable UI in `src/components`, and state in `src/hooks` or `src/lib`.
- `api/` holds the Express gateway (`api/server.ts`) and route handlers (`api/routes/*`). Keep shared client/server types in `src/lib` to avoid drift.
- Static assets reside in `public/` and `src/assets/`; prefer `public/` for raw files served as-is.
- Configuration lives at the repo root (`vite.config.ts`, `tailwind.config.js`, `nodemon.json`). Update docs or examples when changing them.

## Build, Test, and Development Commands
- `npm run dev` starts Vite and the API concurrently for local work.
- `npm run client:dev` runs only the React app; use when the API is mocked.
- `npm run server:dev` boots the Express server with Nodemon for rapid backend iteration.
- `npm run build` type-checks (`tsc -b`) and produces a production bundle.
- `npm run lint` runs ESLint across the repo; fix or document any warnings before review.
- `npm run preview` serves the built client bundle for smoke testing.

## Coding Style & Naming Conventions
- TypeScript across client and server; favor ES modules and top-level async/await.
- Follow the ESLint config (`eslint.config.js`); it enforces hook rules and modern ECMAScript globals.
- Use PascalCase for components, camelCase for functions/variables, and kebab-case for files except React components (`ComponentName.tsx`).
- Co-locate styles with components via `index.css` imports; keep Tailwind utilities in JSX when practical.

## Testing Guidelines
- No automated test suite is bundled yet; add unit tests with Vitest or integration checks under `src/__tests__/` as you contribute features.
- Use descriptive test names (`ComponentName.behavior.spec.tsx`) and prefer RTL for React rendering.
- Run `npm run lint` and manual smoke tests via `npm run preview` before opening a PR.

## Commit & Pull Request Guidelines
- Use Conventional Commit prefixes (`feat:`, `fix:`, `docs:`, `chore:`) followed by a concise imperative summary.
- Reference related tickets or issues in the body; include breaking-change notes when altering APIs.
- PRs should state scope, testing performed, screenshots for UI updates, and any follow-up tasks.
- Keep PRs scoped: separate client, server, and infra changes unless they are tightly coupled.

## Environment & Configuration Tips
- Copy `.env.example` (if present) to `.env` and load via `dotenv`; never commit secrets.
- Backend assumes Node 20+; Python tooling (Flask via `pyproject.toml`) is optional for auxiliary services—document setup if you rely on it.
