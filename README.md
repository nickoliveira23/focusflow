# FocusFlow Monorepo

Portfolio project for a modern Pomodoro experience with immersive focus mode, Google auth, local-first state, and sync-ready backend.

## Stack

- Web: `React + Vite + TypeScript`
- API: `Fastify + TypeScript + SQLite`
- Monorepo: `npm workspaces`

## Project Structure

- `apps/web` frontend app
- `apps/api` backend API
- `packages/contracts` shared types/contracts
- `packages/ui` shared UI package (placeholder)
- `packages/config` shared config package (placeholder)
- `_bmad` BMAD method assets (agent/workflow configs)
- `_bmad-output` BMAD project artifacts (PRD, architecture, epics, sprint status)

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create env files:

```bash
copy apps\\api\\.env.example apps\\api\\.env
copy apps\\web\\.env.example apps\\web\\.env
```

3. Run API and Web in separate terminals:

```bash
npm run dev:api
npm run dev:web
```

4. Access:

- Web: `http://localhost:5173`
- API health: `http://localhost:3001/health`

## Scripts

- `npm run dev:web`
- `npm run dev:api`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run quality` (typecheck + test + build)

## Product and Engineering Process

This repository intentionally keeps BMAD artifacts as part of the portfolio to show end-to-end execution from planning to delivery.

- PRD: `_bmad-output/planning-artifacts/prd.md`
- Architecture: `_bmad-output/planning-artifacts/architecture.md`
- Epics/Stories: `_bmad-output/planning-artifacts/epics.md`
- UX Spec: `_bmad-output/planning-artifacts/ux-design-specification.md`
- Sprint Status: `_bmad-output/implementation-artifacts/sprint-status.yaml`
- Portfolio notes: `docs/portfolio.md`
- Roadmap: `docs/roadmap.md`

## App Docs

- `apps/web/README.md`
- `apps/api/README.md`

## License

No `LICENSE` file yet. Add one before broader public distribution.
