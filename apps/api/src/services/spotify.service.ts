import { createHash, randomBytes } from "node:crypto";
import type { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import type { AppEnv } from "../config/env.js";
import type { ReturnTypeCreateDb } from "../models/db-types.js";
import type { SpotifyTokenState } from "../repositories/spotify.repository.js";
import { SPOTIFY_SCOPES } from "../config/constants.js";

export class SpotifyService {
  private oauthStates = new Map<string, { codeVerifier: string; userId: string }>();
  private spotifyMockConnected = new Set<string>();

  constructor(
    private readonly env: AppEnv,
    private readonly db: ReturnTypeCreateDb,
    private readonly logger: FastifyBaseLogger
  ) {}

  async getStatus(userId: string) {
    if (this.env.spotifyMock) {
      return { connected: this.spotifyMockConnected.has(userId), mock: true };
    }
    const tokens = await this.db.getTokens(userId);
    return { connected: tokens !== null, mock: false };
  }

  async startAuth(userId: string) {
    if (this.env.spotifyMock) {
      this.spotifyMockConnected.add(userId);
      return {
        connected: true,
        authUrl: `${this.env.frontendUrl}/?spotify=connected&mock=1`
      };
    }

    this.ensureSpotifyConfig();

    const state = randomBytes(16).toString("hex");
    const { codeVerifier, codeChallenge } = this.createPkcePair();
    this.oauthStates.set(state, { codeVerifier, userId });

    const params = new URLSearchParams({
      client_id: this.env.spotifyClientId,
      response_type: "code",
      redirect_uri: this.env.spotifyRedirectUri,
      scope: SPOTIFY_SCOPES,
      state,
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
      show_dialog: "true"
    });

    const tokens = await this.db.getTokens(userId);
    return {
      connected: tokens !== null,
      authUrl: `https://accounts.spotify.com/authorize?${params.toString()}`
    };
  }

  async handleCallback(request: FastifyRequest, reply: FastifyReply) {
    if (this.env.spotifyMock) {
      return reply.redirect(`${this.env.frontendUrl}/?spotify=connected&mock=1`);
    }

    this.ensureSpotifyConfig();
    const query = request.query as { code?: string; state?: string; error?: string };

    if (query.error) {
      return reply.redirect(`${this.env.frontendUrl}/?spotify=error`);
    }

    const pending = query.state ? this.oauthStates.get(query.state) : undefined;
    if (!query.code || !query.state || !pending) {
      return reply.redirect(`${this.env.frontendUrl}/?spotify=invalid_state`);
    }

    const basicAuth = Buffer.from(`${this.env.spotifyClientId}:${this.env.spotifyClientSecret}`).toString("base64");
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code: query.code,
      redirect_uri: this.env.spotifyRedirectUri,
      code_verifier: pending.codeVerifier
    });

    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`
      },
      body
    });

    if (!tokenResponse.ok) {
      this.logger.error({ status: tokenResponse.status }, "Spotify token exchange failed");
      return reply.redirect(`${this.env.frontendUrl}/?spotify=token_error`);
    }

    const tokenPayload = (await tokenResponse.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };

    await this.db.upsertTokens(pending.userId, {
      accessToken: tokenPayload.access_token,
      refreshToken: tokenPayload.refresh_token,
      expiresAtMs: Date.now() + tokenPayload.expires_in * 1000
    });

    this.oauthStates.delete(query.state);
    return reply.redirect(`${this.env.frontendUrl}/?spotify=connected`);
  }

  async disconnect(userId: string) {
    if (this.env.spotifyMock) {
      this.spotifyMockConnected.delete(userId);
      return { connected: false };
    }

    await this.db.deleteTokens(userId);
    return { connected: false };
  }

  async getNowPlaying(userId: string) {
    if (this.env.spotifyMock) {
      if (!this.spotifyMockConnected.has(userId)) {
        return { connected: false, playing: false };
      }
      return {
        connected: true,
        playing: true,
        track: { title: "Mock Focus Track", artist: "Mock Artist" }
      };
    }

    const accessToken = await this.getValidAccessToken(userId);
    if (!accessToken) {
      return { connected: false, playing: false };
    }

    const spotifyResponse = await this.fetchSpotifyWithRefresh(userId, "https://api.spotify.com/v1/me/player/currently-playing", accessToken);

    if (spotifyResponse.status === 204) {
      return { connected: true, playing: false };
    }
    if (!spotifyResponse.ok) {
      this.logger.error({ status: spotifyResponse.status }, "Spotify now-playing request failed");
      return { connected: true, playing: false };
    }

    const payload = (await spotifyResponse.json()) as {
      is_playing: boolean;
      item?: { name?: string; artists?: Array<{ name?: string }> };
    };

    const trackTitle = payload.item?.name ?? "";
    const artistName = payload.item?.artists?.map((a) => a.name).filter(Boolean).join(", ");

    return {
      connected: true,
      playing: Boolean(payload.is_playing),
      track: trackTitle ? { title: trackTitle, artist: artistName || "Unknown artist" } : undefined
    };
  }

  async getProfile(userId: string) {
    if (this.env.spotifyMock) {
      if (!this.spotifyMockConnected.has(userId)) {
        return { connected: false };
      }
      return { connected: true, profile: { displayName: "Mock Listener" } };
    }

    const accessToken = await this.getValidAccessToken(userId);
    if (!accessToken) {
      return { connected: false };
    }

    const spotifyResponse = await this.fetchSpotifyWithRefresh(userId, "https://api.spotify.com/v1/me", accessToken);

    if (!spotifyResponse.ok) {
      this.logger.error({ status: spotifyResponse.status }, "Spotify profile request failed");
      return { connected: true };
    }

    const payload = (await spotifyResponse.json()) as {
      display_name?: string;
      images?: Array<{ url?: string }>;
    };

    return {
      connected: true,
      profile: {
        displayName: payload.display_name || "Spotify User",
        avatarUrl: payload.images?.[0]?.url
      }
    };
  }

  private createPkcePair() {
    const codeVerifier = randomBytes(64).toString("base64url");
    const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
    return { codeVerifier, codeChallenge };
  }

  private async refreshSpotifyAccessToken(userId: string): Promise<SpotifyTokenState> {
    const tokens = await this.db.getTokens(userId);
    if (!tokens?.refreshToken) {
      throw new Error("No refresh token available.");
    }

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokens.refreshToken
    });

    const basicAuth = Buffer.from(`${this.env.spotifyClientId}:${this.env.spotifyClientSecret}`).toString("base64");
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`
      },
      body
    });

    if (!response.ok) {
      throw new Error(`Spotify refresh failed (${response.status}).`);
    }

    const payload = (await response.json()) as {
      access_token: string;
      expires_in: number;
      refresh_token?: string;
    };

    const updated: SpotifyTokenState = {
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token ?? tokens.refreshToken,
      expiresAtMs: Date.now() + payload.expires_in * 1000
    };

    await this.db.upsertTokens(userId, updated);
    return updated;
  }

  private async getValidAccessToken(userId: string): Promise<string | null> {
    const tokens = await this.db.getTokens(userId);
    if (!tokens) return null;

    const expiringSoon = tokens.expiresAtMs - Date.now() < 30_000;
    if (expiringSoon) {
      const refreshed = await this.refreshSpotifyAccessToken(userId);
      return refreshed.accessToken;
    }
    return tokens.accessToken;
  }

  private async fetchSpotifyWithRefresh(userId: string, url: string, accessToken: string) {
    const makeRequest = (token: string) =>
      fetch(url, { headers: { Authorization: `Bearer ${token}` } });

    let spotifyResponse = await makeRequest(accessToken);
    if (spotifyResponse.status === 401) {
      const refreshed = await this.refreshSpotifyAccessToken(userId);
      spotifyResponse = await makeRequest(refreshed.accessToken);
    }
    return spotifyResponse;
  }

  private ensureSpotifyConfig() {
    if (!this.env.spotifyClientId || !this.env.spotifyClientSecret || !this.env.spotifyRedirectUri) {
      throw new Error(
        "Spotify environment is not configured. Define SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET and SPOTIFY_REDIRECT_URI."
      );
    }
  }
}
