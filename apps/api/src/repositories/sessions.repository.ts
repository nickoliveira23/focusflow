import type Database from "better-sqlite3";
import type { FocusSessionRecord } from "../models/domain.js";

interface StatsRow {
  sessions: number;
  total_seconds: number;
}

export function createSessionsRepository(db: Database.Database) {
  const insertFocusSessionStmt = db.prepare(`
    INSERT OR IGNORE INTO focus_sessions (
      user_id, id, completed_at_iso, duration_seconds, status
    ) VALUES (
      @user_id, @id, @completed_at_iso, @duration_seconds, @status
    )
  `);

  const countSessionStmt = db.prepare(
    `SELECT COUNT(*) AS count FROM focus_sessions WHERE user_id = ?`
  );

  const statsSummaryStmt = db.prepare(`
    SELECT COUNT(*) AS sessions, COALESCE(SUM(duration_seconds), 0) AS total_seconds
    FROM focus_sessions
    WHERE user_id = ? AND completed_at_iso >= ?
  `);

  const insertSessionsTxn = db.transaction((userId: string, sessions: FocusSessionRecord[]) => {
    let accepted = 0;
    for (const session of sessions) {
      const result = insertFocusSessionStmt.run({
        user_id: userId,
        id: session.id,
        completed_at_iso: session.completedAtIso,
        duration_seconds: Math.max(0, Number(session.durationSeconds ?? 0)),
        status: "completed"
      });
      if (result.changes > 0) {
        accepted += 1;
      }
    }
    return accepted;
  });

  return {
    insertFocusSessionsBulk(userId: string, sessions: FocusSessionRecord[]) {
      const accepted = insertSessionsTxn(userId, sessions);
      const total = (countSessionStmt.get(userId) as { count: number }).count;
      return { accepted, total };
    },

    getStatsSummary(userId: string, range: "day" | "week" | "month") {
      const now = Date.now();
      const windowMs =
        range === "month"
          ? 30 * 24 * 60 * 60 * 1000
          : range === "week"
            ? 7 * 24 * 60 * 60 * 1000
            : 24 * 60 * 60 * 1000;
      const sinceIso = new Date(now - windowMs).toISOString();
      const row = statsSummaryStmt.get(userId, sinceIso) as StatsRow;
      return {
        range,
        sessions: row.sessions,
        focusedMinutes: Math.floor((row.total_seconds ?? 0) / 60)
      };
    }
  };
}
