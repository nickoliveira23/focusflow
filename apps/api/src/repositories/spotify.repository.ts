import type pg from "pg";

interface SpotifyTokenRow {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at_ms: string;
}

export interface SpotifyTokenState {
  accessToken: string;
  refreshToken: string;
  expiresAtMs: number;
}

export function createSpotifyRepository(pool: pg.Pool) {
  return {
    async getTokens(userId: string): Promise<SpotifyTokenState | null> {
      const result = await pool.query<SpotifyTokenRow>(
        `SELECT access_token, refresh_token, expires_at_ms FROM spotify_tokens WHERE user_id = $1`,
        [userId]
      );
      const row = result.rows[0];
      if (!row) return null;
      return {
        accessToken: row.access_token,
        refreshToken: row.refresh_token,
        expiresAtMs: Number(row.expires_at_ms)
      };
    },

    async upsertTokens(userId: string, tokens: SpotifyTokenState): Promise<void> {
      await pool.query(
        `INSERT INTO spotify_tokens (user_id, access_token, refresh_token, expires_at_ms)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT(user_id) DO UPDATE SET
           access_token = EXCLUDED.access_token,
           refresh_token = EXCLUDED.refresh_token,
           expires_at_ms = EXCLUDED.expires_at_ms`,
        [userId, tokens.accessToken, tokens.refreshToken, tokens.expiresAtMs]
      );
    },

    async deleteTokens(userId: string): Promise<void> {
      await pool.query(`DELETE FROM spotify_tokens WHERE user_id = $1`, [userId]);
    }
  };
}
