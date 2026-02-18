# Pomodoro Flow Monorepo

Open-source pomodoro app with:
- Web frontend (`React + Vite + TypeScript`)
- API backend (`Fastify + TypeScript + SQLite`)
- Local-first behavior, optional Google auth, optional Spotify integration

## Monorepo Structure

- `apps/web`: frontend SPA
- `apps/api`: backend API
- `packages/contracts`: shared types/contracts
- `packages/ui`: shared UI package (placeholder)
- `packages/config`: shared config package (placeholder)
- `_bmad-output`: planning/spec artifacts

## Requirements

- Node.js 20+
- npm 10+

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Configure API env:

```bash
copy apps\\api\\.env.example apps\\api\\.env
```

3. Start API and Web in separate terminals:

```bash
npm run dev:api
npm run dev:web
```

4. Open:
- Web: `http://localhost:5173`
- API health: `http://localhost:3001/health`

## Core Scripts

- `npm run dev:web`: start frontend dev server
- `npm run dev:api`: start backend dev server
- `npm run typecheck`: typecheck all workspaces
- `npm run test`: run workspace tests (if present)
- `npm run build`: build all workspaces
- `npm run quality`: typecheck + test + build (quality gate)

## Authentication and Integrations

### Google Login

- Mock mode (default in `.env.example`): `GOOGLE_MOCK=true`
- Real OAuth: set `GOOGLE_MOCK=false` and provide:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - Redirect URI: `http://localhost:3001/api/auth/google/callback`

### Spotify

- Mock mode: `SPOTIFY_MOCK=true`
- Real mode: set `SPOTIFY_MOCK=false` and provide:
  - `SPOTIFY_CLIENT_ID`
  - `SPOTIFY_CLIENT_SECRET`
  - Redirect URI: `http://localhost:3001/api/auth/spotify/callback`

## Documentation

- Product/spec docs: `_bmad-output/planning-artifacts`
- Sprint tracking: `_bmad-output/implementation-artifacts/sprint-status.yaml`
- App-specific docs:
  - `apps/web/README.md`
  - `apps/api/README.md`

## License

No license file is defined yet. Add `LICENSE` before public distribution.
