---
stepsCompleted: ['step-01-init', 'step-02-context', 'step-03-starter', 'step-04-decisions', 'step-05-patterns', 'step-06-structure', 'step-07-validation', 'step-08-complete']
inputDocuments: ['product-brief-pomodoro-app-2026-02-05.md', 'prd.md']
workflowType: 'architecture'
date: 2026-02-17
project_name: pomodoro-app
author: Nicko
---

# Architecture Decision Document

## 1. Architecture Summary

pomodoro-app will be a web-first, local-first productivity platform with a strong focus UX and optional Spotify context.
The MVP architecture is split into:

- Frontend SPA: React + TypeScript + Vite, installable as PWA.
- Backend API: Node.js + Fastify + SQLite for auth and sync in MVP.
- Shared contracts: TypeScript DTOs/contracts in monorepo packages.

This gives fast MVP delivery while keeping a clean path for future social features without major refactors.

### 1.1 Implementation Snapshot (2026-02-18)

Current codebase is aligned to:

- Web: React + Vite + TypeScript, componentized UI with hooks.
- API: Fastify + TypeScript + `better-sqlite3`.
- Local persistence: `localStorage` for settings, timer state, queue, and local events.
- Auth: Google login with session cookies.
- Spotify: integration path implemented, currently disabled in UI until Premium validation.
- Quality gate: `npm run quality` (typecheck + tests + build), plus GitHub Actions CI.

### 1.2 Post-MVP Target Direction (kept intentionally)

The following remain valid as future direction, not current implementation details:

- PostgreSQL migration for production-grade multi-user scale.
- IndexedDB migration for richer offline datasets.
- OpenAPI-first contract publishing.
- Presence/social module behind feature flags.

## 2. Key Decisions

### Decision A: Frontend stack

- Use React + TypeScript + Vite.
- Current: custom hooks and explicit fetch layer for server-state and local state.
- Post-MVP option: evaluate TanStack Query/Zustand/React Router if complexity increases.

Reasoning:
- Fast iteration and low complexity for a low-complexity greenfield app.
- Clear separation of timer state, persisted settings, and remote sync data.

### Decision B: Timer engine correctness

- Timer source of truth is `startedAt + duration`, not `setInterval` counters.
- Recompute remaining time from monotonic timestamps on each tick.
- Keep timer resilient across tab sleep, reload, and offline mode.

Reasoning:
- Meets accuracy and reliability goals.
- Prevents drift and state corruption in long sessions.

### Decision C: Data persistence model

- Current local-first storage with `localStorage` for sessions/settings/timer/sync queue.
- Server sync for authenticated users only.
- Conflict strategy: latest-write-wins for settings, append-only for focus sessions.

Reasoning:
- Supports offline requirement from day one.
- Allows progressive onboarding before account/Spotify connection.

### Decision D: Spotify integration boundary

- Use OAuth Authorization Code with PKCE.
- OAuth callback and token refresh handled by backend.
- Frontend never stores Spotify client secret.

Reasoning:
- Secure token lifecycle.
- Stable integration for long-running focus sessions.

### Decision E: Future shared-presence readiness

- Keep social domain isolated in backend module `presence`.
- Do not couple timer flow to presence data.
- Presence data is read-only in breaks, optional, and soft-failure tolerant.

Reasoning:
- Enables future rollout without changing core timer architecture.
- Reduces distraction risk by keeping focus mode independent.

## 3. System Context

### External integrations

- Spotify Web API for current playback context.
- Browser APIs: Notifications, Visibility API (Service Worker/IndexedDB planned).

### Core domains

- `focus`: timer cycle, work/break transitions, completion events.
- `settings`: durations, cycle pattern, UI micro-preferences.
- `stats`: daily/weekly aggregates, streaks, completion rates.
- `spotify`: account link state and current track metadata.
- `presence` (future): aggregated anonymous break feed.

## 4. Component Architecture

### Frontend modules

- `app-shell`: routing, layout, theme bootstrapping.
- `timer-engine`: deterministic timer state machine.
- `focus-ui`: immersive countdown, transitions, rituals.
- `settings-ui`: timer and micro-configuration controls.
- `stats-ui`: dashboard and historical summaries.
- `spotify-ui`: connect/disconnect and current track widget.
- `sync-client`: background sync and retry queue.

### Backend modules

- `auth`: session and Spotify OAuth.
- `users`: profile and preferences API.
- `focus-sessions`: write/read focus events and aggregates.
- `spotify`: token refresh and now-playing proxy endpoint.
- `presence` (future): anonymous aggregate stream for breaks.

## 5. Data Model (MVP)

### Local entities (Current: localStorage)

- `timer_settings`
- `focus_sessions_local`
- `daily_stats_cache`
- `ui_preferences`
- `sync_queue`

### Server entities (Current: SQLite, Target: PostgreSQL)

- `users`
- `user_settings`
- `focus_sessions`
- `spotify_connections`
- `sync_cursors`

## 6. API Contracts (MVP)

- `POST /api/auth/spotify/start`
- `GET /api/auth/spotify/callback`
- `POST /api/auth/spotify/disconnect`
- `GET /api/spotify/now-playing`
- `GET /api/settings`
- `PUT /api/settings`
- `POST /api/focus-sessions/bulk`
- `GET /api/stats/summary?range=day|week|month`

## 7. Non-Functional Strategy

### Performance

- Initial JS payload budget: <= 220KB gz for MVP shell.
- Timer UI updates at 1Hz visual tick with time computed from timestamps.
- Heavy views loaded lazily (stats/history/settings panels).

### Reliability

- Offline-first timer and local persistence mandatory.
- Sync queue with exponential backoff and idempotent session writes.
- Graceful degradation when Spotify API fails.

### Security

- OAuth PKCE, secure cookies for app session.
- No Spotify secrets in browser.
- Input validation on all write endpoints.

### Observability

- Client events: timer_started, timer_completed, timer_abandoned, spotify_connected.
- Backend metrics: auth_success_rate, sync_success_rate, now_playing_latency.

## 8. Delivery Structure

### Suggested repo layout

```txt
/apps
  /web
  /api
/packages
  /contracts
  /ui
  /config
```

### Build and deploy

- Web: static deploy (Vercel/Netlify compatible) with PWA assets.
- API: containerized Node service (Fly.io/Render/Railway compatible).
- Current DB: SQLite file (`better-sqlite3`).
- Post-MVP target DB: managed PostgreSQL.

## 9. Risks and Mitigations

- Spotify rate limits or playback endpoint inconsistency
  - Mitigation: cached now-playing fallback and bounded polling interval.
- Timer drift from background tab throttling
  - Mitigation: timestamp-based computation and visibility resume reconciliation.
- Over-engineering before MVP validation
  - Mitigation: keep social presence behind feature flags and no hard dependencies.

## 10. Architecture Exit Criteria

- Timer engine passes drift and resume tests.
- Offline flow works without backend.
- Settings persist and restore correctly.
- Spotify connect/disconnect and now-playing work for authenticated users.
- API contracts versioned and validated by schema tests.
