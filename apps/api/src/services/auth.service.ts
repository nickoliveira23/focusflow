import { randomBytes } from "node:crypto";
import type { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { AppEnv } from "../config/env.js";
import type { ReturnTypeCreateDb } from "../models/db-types.js";
import { DEFAULT_USER_ID } from "../config/constants.js";

export class AuthService {
  private googleOauthState = "";
  private readonly googleJwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

  constructor(
    private readonly db: ReturnTypeCreateDb,
    private readonly env: AppEnv,
    private readonly logger: FastifyBaseLogger
  ) {}

  getAuthUserFromRequest(request: FastifyRequest) {
    const sessionId = request.cookies[this.env.sessionCookieName];
    if (!sessionId) {
      return null;
    }
    return this.db.getUserBySession(sessionId);
  }

  resolveUserId(request: FastifyRequest): string {
    const user = this.getAuthUserFromRequest(request);
    return user?.id ?? DEFAULT_USER_ID;
  }

  getMe(request: FastifyRequest) {
    const user = this.getAuthUserFromRequest(request);
    if (!user) {
      return { authenticated: false };
    }
    return {
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl
      }
    };
  }

  startGoogleAuth() {
    if (this.env.googleMock) {
      return { authUrl: `${this.env.frontendUrl}/?auth=connected&provider=google&mock=1` };
    }
    this.ensureGoogleConfig();
    const state = randomBytes(16).toString("hex");
    this.googleOauthState = state;

    const params = new URLSearchParams({
      client_id: this.env.googleClientId,
      redirect_uri: this.env.googleRedirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "offline",
      prompt: "consent"
    });

    return {
      authUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    };
  }

  async handleGoogleCallback(request: FastifyRequest, reply: FastifyReply) {
    if (this.env.googleMock) {
      const mockUser = this.db.upsertGoogleUser({
        googleSub: "mock-google-sub",
        email: "mock-user@example.com",
        name: "Mock User",
        avatarUrl: "https://placehold.co/80x80"
      });
      this.setSessionCookie(reply, mockUser.id);
      return reply.redirect(`${this.env.frontendUrl}/?auth=connected&provider=google&mock=1`);
    }

    this.ensureGoogleConfig();
    const query = request.query as { code?: string; state?: string; error?: string };

    if (query.error) {
      return reply.redirect(`${this.env.frontendUrl}/?auth=error&provider=google`);
    }

    if (!query.code || !query.state || query.state !== this.googleOauthState) {
      return reply.redirect(`${this.env.frontendUrl}/?auth=invalid_state&provider=google`);
    }

    const body = new URLSearchParams({
      code: query.code,
      client_id: this.env.googleClientId,
      client_secret: this.env.googleClientSecret,
      redirect_uri: this.env.googleRedirectUri,
      grant_type: "authorization_code"
    });

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });

    if (!tokenResponse.ok) {
      this.logger.error({ status: tokenResponse.status }, "Google token exchange failed");
      return reply.redirect(`${this.env.frontendUrl}/?auth=token_error&provider=google`);
    }

    const tokenPayload = (await tokenResponse.json()) as { id_token?: string };
    if (!tokenPayload.id_token) {
      return reply.redirect(`${this.env.frontendUrl}/?auth=token_error&provider=google`);
    }

    const verified = await jwtVerify(tokenPayload.id_token, this.googleJwks, {
      audience: this.env.googleClientId,
      issuer: ["https://accounts.google.com", "accounts.google.com"]
    });

    const claims = verified.payload as {
      sub: string;
      email?: string;
      name?: string;
      picture?: string;
    };

    const user = this.db.upsertGoogleUser({
      googleSub: claims.sub,
      email: claims.email ?? "",
      name: claims.name ?? "Google User",
      avatarUrl: claims.picture ?? ""
    });

    this.setSessionCookie(reply, user.id);
    this.googleOauthState = "";
    return reply.redirect(`${this.env.frontendUrl}/?auth=connected&provider=google`);
  }

  logout(request: FastifyRequest, reply: FastifyReply) {
    const sessionId = request.cookies[this.env.sessionCookieName];
    if (sessionId) {
      this.db.deleteSession(sessionId);
    }
    reply.clearCookie(this.env.sessionCookieName, { path: "/" });
    return { success: true };
  }

  private setSessionCookie(reply: FastifyReply, userId: string) {
    const session = this.db.createUserSession(userId, this.env.sessionTtlDays);
    reply.setCookie(this.env.sessionCookieName, session.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: this.env.sessionTtlDays * 24 * 60 * 60
    });
  }

  private ensureGoogleConfig() {
    if (!this.env.googleClientId || !this.env.googleClientSecret || !this.env.googleRedirectUri) {
      throw new Error(
        "Google environment is not configured. Define GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI."
      );
    }
  }
}
