import type pg from "pg";
import type { TimerSettings } from "../models/domain.js";

interface SettingsRow {
  settings_json: string;
}

export function createSettingsRepository(pool: pg.Pool) {
  return {
    async getSettings(userId: string, fallback: TimerSettings): Promise<TimerSettings> {
      const result = await pool.query<SettingsRow>(
        `SELECT settings_json FROM settings WHERE user_id = $1`,
        [userId]
      );
      const row = result.rows[0];
      if (!row) {
        await pool.query(
          `INSERT INTO settings (user_id, settings_json, updated_at)
           VALUES ($1, $2, $3)
           ON CONFLICT(user_id) DO UPDATE SET
             settings_json = EXCLUDED.settings_json,
             updated_at = EXCLUDED.updated_at`,
          [userId, JSON.stringify(fallback), new Date().toISOString()]
        );
        return fallback;
      }
      try {
        return JSON.parse(row.settings_json) as TimerSettings;
      } catch {
        return fallback;
      }
    },

    async upsertSettings(userId: string, settings: TimerSettings): Promise<TimerSettings> {
      await pool.query(
        `INSERT INTO settings (user_id, settings_json, updated_at)
         VALUES ($1, $2, $3)
         ON CONFLICT(user_id) DO UPDATE SET
           settings_json = EXCLUDED.settings_json,
           updated_at = EXCLUDED.updated_at`,
        [userId, JSON.stringify(settings), new Date().toISOString()]
      );
      return settings;
    }
  };
}
