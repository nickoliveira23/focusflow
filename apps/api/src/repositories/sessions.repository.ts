import type pg from "pg";
import type { FocusSessionRecord } from "../models/domain.js";

interface StatsRow {
  sessions: string;
  total_seconds: string;
}

export function createSessionsRepository(pool: pg.Pool) {
  return {
    async insertFocusSessionsBulk(userId: string, sessions: FocusSessionRecord[]) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        let accepted = 0;
        for (const session of sessions) {
          const result = await client.query(
            `INSERT INTO focus_sessions (user_id, id, completed_at_iso, duration_seconds, status)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT DO NOTHING`,
            [
              userId,
              session.id,
              session.completedAtIso,
              Math.max(0, Number(session.durationSeconds ?? 0)),
              "completed"
            ]
          );
          if (result.rowCount && result.rowCount > 0) {
            accepted += 1;
          }
        }
        await client.query("COMMIT");

        const countResult = await pool.query(
          `SELECT COUNT(*) AS count FROM focus_sessions WHERE user_id = $1`,
          [userId]
        );
        const total = Number(countResult.rows[0].count);
        return { accepted, total };
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    },

    async getStatsSummary(userId: string, range: "day" | "week" | "month") {
      const now = Date.now();
      const windowMs =
        range === "month"
          ? 30 * 24 * 60 * 60 * 1000
          : range === "week"
            ? 7 * 24 * 60 * 60 * 1000
            : 24 * 60 * 60 * 1000;
      const sinceIso = new Date(now - windowMs).toISOString();

      const result = await pool.query<StatsRow>(
        `SELECT COUNT(*) AS sessions, COALESCE(SUM(duration_seconds), 0) AS total_seconds
         FROM focus_sessions
         WHERE user_id = $1 AND completed_at_iso >= $2`,
        [userId, sinceIso]
      );
      const row = result.rows[0];
      return {
        range,
        sessions: Number(row.sessions),
        focusedMinutes: Math.floor(Number(row.total_seconds ?? 0) / 60)
      };
    }
  };
}
