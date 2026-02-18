import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import type { AuthUser, FocusSessionRecord, TimerSettings } from "./models/domain.js";
import { createSettingsRepository } from "./repositories/settings.repository.js";
import { createSessionsRepository } from "./repositories/sessions.repository.js";
import { createUsersRepository } from "./repositories/users.repository.js";

export type { AuthUser, FocusSessionRecord, TimerSettings };

export function createDb(dbPath: string) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
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
  `);

  const settingsRepository = createSettingsRepository(db);
  const sessionsRepository = createSessionsRepository(db);
  const usersRepository = createUsersRepository(db);

  return {
    ...settingsRepository,
    ...sessionsRepository,
    ...usersRepository
  };
}
