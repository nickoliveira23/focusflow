# @pomodoro/api

Backend API for Pomodoro Flow.

## Stack

- Fastify
- TypeScript
- SQLite (`better-sqlite3`)

## Requirements

- Node.js 20+
- npm 10+

## Environment

Copy:

```bash
copy .env.example .env
```

Main variables:

- `PORT` (optional, default `3001`)
- `FRONTEND_URL` (default `http://localhost:5173`)
- `COOKIE_SECRET`
- `DB_PATH` (default `./data/pomodoro.sqlite`)
- `GOOGLE_MOCK` (`true` for local mock auth)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- `SPOTIFY_MOCK` (`true` for local Spotify mock)
- `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REDIRECT_URI`

## Run

From monorepo root:

```bash
npm run dev:api
```

Or from this folder:

```bash
npm run dev
```

## Scripts

- `npm run dev`: dev mode with watch
- `npm run build`: compile TypeScript
- `npm run start`: run compiled server
- `npm run typecheck`: TypeScript check
- `npm run test`: Vitest integration tests

## Main Endpoints

- `GET /health`
- `GET /api/auth/me`
- `GET /api/auth/google/start`
- `GET /api/auth/google/callback`
- `POST /api/auth/logout`
- `GET /api/settings`
- `PUT /api/settings`
- `POST /api/focus-sessions/bulk`
- `GET /api/stats/summary`
- `GET /api/spotify/status`
- `POST /api/auth/spotify/start`
- `GET /api/auth/spotify/callback`
- `POST /api/auth/spotify/disconnect`
- `GET /api/spotify/now-playing`
- `GET /api/spotify/profile`

Note: Spotify endpoints (except callback) require an authenticated Google session.

## Testing

Current integration tests validate:
- Google mock login/logout flow
- Settings scoping between guest and authenticated user

Run:

```bash
npm run test
```
