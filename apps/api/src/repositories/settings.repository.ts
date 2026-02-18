import type Database from "better-sqlite3";
import type { TimerSettings } from "../models/domain.js";

interface SettingsRow {
  settings_json: string;
}

export function createSettingsRepository(db: Database.Database) {
  const selectSettingsStmt = db.prepare(
    `SELECT settings_json FROM settings WHERE user_id = ?`
  );

  const upsertSettingsStmt = db.prepare(`
    INSERT INTO settings (user_id, settings_json, updated_at)
    VALUES (@user_id, @settings_json, @updated_at)
    ON CONFLICT(user_id) DO UPDATE SET
      settings_json = excluded.settings_json,
      updated_at = excluded.updated_at
  `);

  return {
    getSettings(userId: string, fallback: TimerSettings): TimerSettings {
      const row = selectSettingsStmt.get(userId) as SettingsRow | undefined;
      if (!row) {
        upsertSettingsStmt.run({
          user_id: userId,
          settings_json: JSON.stringify(fallback),
          updated_at: new Date().toISOString()
        });
        return fallback;
      }
      try {
        return JSON.parse(row.settings_json) as TimerSettings;
      } catch {
        return fallback;
      }
    },

    upsertSettings(userId: string, settings: TimerSettings) {
      upsertSettingsStmt.run({
        user_id: userId,
        settings_json: JSON.stringify(settings),
        updated_at: new Date().toISOString()
      });
      return settings;
    }
  };
}
