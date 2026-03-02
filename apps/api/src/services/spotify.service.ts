import { createHash, randomBytes } from "node:crypto";
import type { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import type { AppEnv } from "../config/env.js";
import { SPOTIFY_SCOPES } from "../config/constants.js";

interface SpotifyTokenState {
  accessToken: string;
  refreshToken: string;
  expiresAtMs: number;
}

export class SpotifyService {
  private spotifyTokenState: SpotifyTokenState | null = null;
  private oauthState = "";
  private oauthCodeVerifier = "";
  private spotifyMockConnected = false;

  constructor(
    private readonly env: AppEnv,
    private readonly logger: FastifyBaseLogger
  ) {}

  getStatus() {
    return {
      connected: this.env.spotifyMock ? this.spotifyMockConnected : this.spotifyTokenState !== null,
      mock: this.env.spotifyMock
    };
  }

  async startAuth() {
    if (this.env.spotifyMock) {
      this.spotifyMockConnected = true;
      return {
        connected: true,
        authUrl: `${this.env.frontendUrl}/?spotify=connected&mock=1`
      };
    }

    this.ensureSpotifyConfig();

    const state = randomBytes(16).toString("hex");
    const { codeVerifier, codeChallenge } = this.createPkcePair();
    this.oauthState = state;
    this.oauthCodeVerifier = codeVerifier;

    const params = new URLSearchParams({
      client_id: this.env.spotifyClientId,
      response_type: "code",
      redirect_uri: this.env.spotifyRedirectUri,
      scope: SPOTIFY_SCOPES,
      state,
      code_challenge_method: "S256",
      code_challenge: codeChallenge
    });

    return {
      connected: this.spotifyTokenState !== null,
      authUrl: `https://accounts.spotify.com/authorize?${params.toString()}`
    };
  }

  async handleCallback(request: FastifyRequest, reply: FastifyReply) {
    if (this.env.spotifyMock) {
      this.spotifyMockConnected = true;
      return reply.redirect(`${this.env.frontendUrl}/?spotify=connected&mock=1`);
    }

    this.ensureSpotifyConfig();
    const query = request.query as { code?: string; state?: string; error?: string };

    if (query.error) {
      return reply.redirect(`${this.env.frontendUrl}/?spotify=error`);
    }
    if (!query.code || !query.state || query.state !== this.oauthState) {
      return reply.redirect(`${this.env.frontendUrl}/?spotify=invalid_state`);
    }

    const basicAuth = Buffer.from(`${this.env.spotifyClientId}:${this.env.spotifyClientSecret}`).toString("base64");
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code: query.code,
      redirect_uri: this.env.spotifyRedirectUri,
      code_verifier: this.oauthCodeVerifier
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

    this.spotifyTokenState = {
      accessToken: tokenPayload.access_token,
      refreshToken: tokenPayload.refresh_token,
      expiresAtMs: Date.now() + tokenPayload.expires_in * 1000
    };
    this.oauthState = "";
    this.oauthCodeVerifier = "";

    return reply.redirect(`${this.env.frontendUrl}/?spotify=connected`);
  }

  disconnect() {
    if (this.env.spotifyMock) {
      this.spotifyMockConnected = false;
      return { connected: false };
    }

    this.spotifyTokenState = null;
    return { connected: false };
  }

  async getNowPlaying() {
    if (this.env.spotifyMock) {
      if (!this.spotifyMockConnected) {
        return { connected: false, playing: false };
      }
      return {
        connected: true,
        playing: true,
        track: {
          title: "Mock Focus Track",
          artist: "Mock Artist"
        }
      };
    }

    const accessToken = await this.getValidAccessToken();
    if (!accessToken) {
      return { connected: false, playing: false };
    }

    const spotifyResponse = await this.fetchSpotifyWithRefresh(
      "https://api.spotify.com/v1/me/player/currently-playing",
      accessToken
    );

    if (spotifyResponse.status === 204) {
      return { connected: true, playing: false };
    }
    if (!spotifyResponse.ok) {
      this.logger.error({ status: spotifyResponse.status }, "Spotify now-playing request failed");
      return { connected: true, playing: false };
    }

    const payload = (await spotifyResponse.json()) as {
      is_playing: boolean;
      item?: {
        name?: string;
        artists?: Array<{ name?: string }>;
      };
    };

    const trackTitle = payload.item?.name ?? "";
    const artistName = payload.item?.artists?.map((artist) => artist.name).filter(Boolean).join(", ");

    return {
      connected: true,
      playing: Boolean(payload.is_playing),
      track: trackTitle
        ? {
            title: trackTitle,
            artist: artistName || "Unknown artist"
          }
        : undefined
    };
  }

  async getProfile() {
    if (this.env.spotifyMock) {
      if (!this.spotifyMockConnected) {
        return { connected: false };
      }
      return {
        connected: true,
        profile: {
          displayName: "Mock Listener"
        }
      };
    }

    const accessToken = await this.getValidAccessToken();
    if (!accessToken) {
      return { connected: false };
    }

    const spotifyResponse = await this.fetchSpotifyWithRefresh(
      "https://api.spotify.com/v1/me",
      accessToken
    );

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

  private async refreshSpotifyAccessToken() {
    if (!this.spotifyTokenState?.refreshToken) {
      throw new Error("No refresh token available.");
    }

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: this.spotifyTokenState.refreshToken
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

    this.spotifyTokenState = {
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token ?? this.spotifyTokenState.refreshToken,
      expiresAtMs: Date.now() + payload.expires_in * 1000
    };
  }

  private async getValidAccessToken() {
    if (!this.spotifyTokenState) {
      return null;
    }
    const expiringSoon = this.spotifyTokenState.expiresAtMs - Date.now() < 30_000;
    if (expiringSoon) {
      await this.refreshSpotifyAccessToken();
    }
    return this.spotifyTokenState.accessToken;
  }

  private async fetchSpotifyWithRefresh(url: string, accessToken: string) {
    const makeRequest = (token: string) =>
      fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

    let spotifyResponse = await makeRequest(accessToken);
    if (spotifyResponse.status === 401 && this.spotifyTokenState?.refreshToken) {
      await this.refreshSpotifyAccessToken();
      spotifyResponse = await makeRequest(this.spotifyTokenState.accessToken);
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
