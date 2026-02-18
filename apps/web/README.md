# @pomodoro/web

Frontend application for Pomodoro Flow.

## Stack

- React 18
- TypeScript
- Vite
- shadcn/ui (Radix-based primitives)

## Requirements

- Node.js 20+
- npm 10+
- API running (default fallback is `http://localhost:3001`)

## Environment

Create `apps/web/.env` from `apps/web/.env.example`:

```bash
copy .env.example .env
```

Variables:
- `VITE_API_BASE_URL`: backend base URL (example: `http://localhost:3001`)

## Run

From monorepo root:

```bash
npm run dev:web
```

Or from this folder:

```bash
npm run dev
```

Default URL: `http://localhost:5173`

## Scripts

- `npm run dev`: dev server
- `npm run build`: production build
- `npm run preview`: preview production build
- `npm run typecheck`: TypeScript check
- `npm run test`: Vitest test suite

## Testing

Current tests cover:
- Utility behavior (`formatTimeFromSeconds`, normalization, storage keys)
- Timer engine behavior for settings realignment rules

Run:

```bash
npm run test
```

## Notes

- API base URL is configurable via `VITE_API_BASE_URL`.
- In local development, fallback is `http://localhost:3001`.
- In production, `VITE_API_BASE_URL` is required.
- Theme/logo behavior changes by focus mode and accent.
