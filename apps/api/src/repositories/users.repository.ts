import { randomBytes } from "node:crypto";
import type Database from "better-sqlite3";
import type { AuthUser } from "../models/domain.js";

interface AuthUserRow {
  id: string;
  google_sub: string;
  email: string;
  name: string;
  avatar_url: string;
}

export function createUsersRepository(db: Database.Database) {
  const upsertUserByGoogleSubStmt = db.prepare(`
    INSERT INTO users (
      id, google_sub, email, name, avatar_url, created_at, updated_at
    ) VALUES (
      @id, @google_sub, @email, @name, @avatar_url, @created_at, @updated_at
    )
    ON CONFLICT(google_sub) DO UPDATE SET
      email = excluded.email,
      name = excluded.name,
      avatar_url = excluded.avatar_url,
      updated_at = excluded.updated_at
  `);

  const selectUserByGoogleSubStmt = db.prepare(
    `SELECT id, google_sub, email, name, avatar_url FROM users WHERE google_sub = ?`
  );

  const selectUserBySessionStmt = db.prepare(`
    SELECT u.id, u.google_sub, u.email, u.name, u.avatar_url
    FROM user_sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.id = ? AND s.expires_at_iso > ?
  `);

  const insertSessionStmt = db.prepare(`
    INSERT INTO user_sessions (id, user_id, expires_at_iso, created_at_iso)
    VALUES (@id, @user_id, @expires_at_iso, @created_at_iso)
  `);

  const deleteSessionStmt = db.prepare(`DELETE FROM user_sessions WHERE id = ?`);

  return {
    upsertGoogleUser(profile: {
      googleSub: string;
      email: string;
      name: string;
      avatarUrl: string;
    }): AuthUser {
      const nowIso = new Date().toISOString();
      const row = selectUserByGoogleSubStmt.get(profile.googleSub) as AuthUserRow | undefined;
      const userId = row?.id ?? randomBytes(16).toString("hex");
      upsertUserByGoogleSubStmt.run({
        id: userId,
        google_sub: profile.googleSub,
        email: profile.email,
        name: profile.name,
        avatar_url: profile.avatarUrl,
        created_at: nowIso,
        updated_at: nowIso
      });
      const stored = selectUserByGoogleSubStmt.get(profile.googleSub) as AuthUserRow;
      return {
        id: stored.id,
        googleSub: stored.google_sub,
        email: stored.email,
        name: stored.name,
        avatarUrl: stored.avatar_url
      };
    },

    createUserSession(userId: string, ttlDays: number) {
      const id = randomBytes(24).toString("hex");
      const now = new Date();
      const expiresAt = new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000);
      insertSessionStmt.run({
        id,
        user_id: userId,
        expires_at_iso: expiresAt.toISOString(),
        created_at_iso: now.toISOString()
      });
      return {
        id,
        expiresAtIso: expiresAt.toISOString()
      };
    },

    getUserBySession(sessionId: string): AuthUser | null {
      const row = selectUserBySessionStmt.get(
        sessionId,
        new Date().toISOString()
      ) as AuthUserRow | undefined;
      if (!row) {
        return null;
      }
      return {
        id: row.id,
        googleSub: row.google_sub,
        email: row.email,
        name: row.name,
        avatarUrl: row.avatar_url
      };
    },

    deleteSession(sessionId: string) {
      deleteSessionStmt.run(sessionId);
    }
  };
}
