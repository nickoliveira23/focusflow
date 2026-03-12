import { randomBytes } from "node:crypto";
import type pg from "pg";
import type { AuthUser } from "../models/domain.js";

interface AuthUserRow {
  id: string;
  google_sub: string;
  email: string;
  name: string;
  avatar_url: string;
}

export function createUsersRepository(pool: pg.Pool) {
  return {
    async upsertGoogleUser(profile: {
      googleSub: string;
      email: string;
      name: string;
      avatarUrl: string;
    }): Promise<AuthUser> {
      const nowIso = new Date().toISOString();
      const existing = await pool.query<AuthUserRow>(
        `SELECT id, google_sub, email, name, avatar_url FROM users WHERE google_sub = $1`,
        [profile.googleSub]
      );
      const userId = existing.rows[0]?.id ?? randomBytes(16).toString("hex");

      await pool.query(
        `INSERT INTO users (id, google_sub, email, name, avatar_url, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT(google_sub) DO UPDATE SET
           email = EXCLUDED.email,
           name = EXCLUDED.name,
           avatar_url = EXCLUDED.avatar_url,
           updated_at = EXCLUDED.updated_at`,
        [userId, profile.googleSub, profile.email, profile.name, profile.avatarUrl, nowIso, nowIso]
      );

      const stored = await pool.query<AuthUserRow>(
        `SELECT id, google_sub, email, name, avatar_url FROM users WHERE google_sub = $1`,
        [profile.googleSub]
      );
      const row = stored.rows[0];
      return {
        id: row.id,
        googleSub: row.google_sub,
        email: row.email,
        name: row.name,
        avatarUrl: row.avatar_url
      };
    },

    async createUserSession(userId: string, ttlDays: number) {
      const id = randomBytes(24).toString("hex");
      const now = new Date();
      const expiresAt = new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000);

      await pool.query(
        `INSERT INTO user_sessions (id, user_id, expires_at_iso, created_at_iso)
         VALUES ($1, $2, $3, $4)`,
        [id, userId, expiresAt.toISOString(), now.toISOString()]
      );

      return {
        id,
        expiresAtIso: expiresAt.toISOString()
      };
    },

    async getUserBySession(sessionId: string): Promise<AuthUser | null> {
      const result = await pool.query<AuthUserRow>(
        `SELECT u.id, u.google_sub, u.email, u.name, u.avatar_url
         FROM user_sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.id = $1 AND s.expires_at_iso > $2`,
        [sessionId, new Date().toISOString()]
      );
      const row = result.rows[0];
      if (!row) return null;
      return {
        id: row.id,
        googleSub: row.google_sub,
        email: row.email,
        name: row.name,
        avatarUrl: row.avatar_url
      };
    },

    async deleteSession(sessionId: string) {
      await pool.query(`DELETE FROM user_sessions WHERE id = $1`, [sessionId]);
    },

    async deleteUserData(userId: string) {
      await pool.query(`DELETE FROM user_sessions WHERE user_id = $1`, [userId]);
      await pool.query(`DELETE FROM focus_sessions WHERE user_id = $1`, [userId]);
      await pool.query(`DELETE FROM settings WHERE user_id = $1`, [userId]);
      await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
    }
  };
}
