import pg from "pg";
import type { AuthUser, FocusSessionRecord, TimerSettings } from "./models/domain.js";
import { createSettingsRepository } from "./repositories/settings.repository.js";
import { createSessionsRepository } from "./repositories/sessions.repository.js";
import { createUsersRepository } from "./repositories/users.repository.js";
import { createSpotifyRepository } from "./repositories/spotify.repository.js";

export type { AuthUser, FocusSessionRecord, TimerSettings };

export async function createDb(databaseUrl: string) {
  const pool = new pg.Pool({ connectionString: databaseUrl });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      user_id TEXT PRIMARY KEY,
      settings_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS focus_sessions (
      user_id TEXT NOT NULL,
      id TEXT NOT NULL,
      completed_at_iso TEXT NOT NULL,
      duration_seconds INTEGER NOT NULL,
      status TEXT NOT NULL,
      PRIMARY KEY (user_id, id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      google_sub TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar_url TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at_iso TEXT NOT NULL,
      created_at_iso TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS spotify_tokens (
      user_id TEXT PRIMARY KEY,
      access_token TEXT NOT NULL,
      refresh_token TEXT NOT NULL,
      expires_at_ms BIGINT NOT NULL
    );
  `);

  const settingsRepository = createSettingsRepository(pool);
  const sessionsRepository = createSessionsRepository(pool);
  const usersRepository = createUsersRepository(pool);
  const spotifyRepository = createSpotifyRepository(pool);

  return {
    ...settingsRepository,
    ...sessionsRepository,
    ...usersRepository,
    ...spotifyRepository,
    async close() {
      await pool.end();
    }
  };
}
