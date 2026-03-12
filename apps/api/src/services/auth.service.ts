import { randomBytes } from "node:crypto";
import type { FastifyBaseLogger, FastifyReply, FastifyRequest } from "fastify";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { AppEnv } from "../config/env.js";
import type { ReturnTypeCreateDb } from "../models/db-types.js";
import { DEFAULT_USER_ID } from "../config/constants.js";

export class AuthService {
  private googleOauthStates = new Set<string>();
  private readonly googleJwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

  constructor(
    private readonly db: ReturnTypeCreateDb,
    private readonly env: AppEnv,
    private readonly logger: FastifyBaseLogger
  ) {}

  async getAuthUserFromRequest(request: FastifyRequest) {
    const sessionId = request.cookies[this.env.sessionCookieName];
    if (!sessionId) {
      return null;
    }
    return this.db.getUserBySession(sessionId);
  }

  async resolveUserId(request: FastifyRequest): Promise<string> {
    const user = await this.getAuthUserFromRequest(request);
    return user?.id ?? DEFAULT_USER_ID;
  }

  async getMe(request: FastifyRequest) {
    const user = await this.getAuthUserFromRequest(request);
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
    this.googleOauthStates.add(state);

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
      const mockUser = await this.db.upsertGoogleUser({
        googleSub: "mock-google-sub",
        email: "mock-user@example.com",
        name: "Mock User",
        avatarUrl: "https://placehold.co/80x80"
      });
      await this.setSessionCookie(reply, mockUser.id);
      return reply.redirect(`${this.env.frontendUrl}/?auth=connected&provider=google&mock=1`);
    }

    this.ensureGoogleConfig();
    const query = request.query as { code?: string; state?: string; error?: string };

    if (query.error) {
      return reply.redirect(`${this.env.frontendUrl}/?auth=error&provider=google`);
    }

    if (!query.code || !query.state || !this.googleOauthStates.has(query.state)) {
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

    const user = await this.db.upsertGoogleUser({
      googleSub: claims.sub,
      email: claims.email ?? "",
      name: claims.name ?? "Google User",
      avatarUrl: claims.picture ?? ""
    });

    await this.setSessionCookie(reply, user.id);
    this.googleOauthStates.delete(query.state);
    return reply.redirect(`${this.env.frontendUrl}/?auth=connected&provider=google`);
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const sessionId = request.cookies[this.env.sessionCookieName];
    if (sessionId) {
      await this.db.deleteSession(sessionId);
    }
    reply.clearCookie(this.env.sessionCookieName, { path: "/" });
    return { success: true };
  }

  async deleteAccount(request: FastifyRequest, reply: FastifyReply) {
    const user = await this.getAuthUserFromRequest(request);
    if (!user) {
      return reply.code(401).send({ error: "AUTH_REQUIRED" });
    }
    await this.db.deleteUserData(user.id);
    reply.clearCookie(this.env.sessionCookieName, { path: "/" });
    return { success: true };
  }

  private async setSessionCookie(reply: FastifyReply, userId: string) {
    const session = await this.db.createUserSession(userId, this.env.sessionTtlDays);
    const isProduction = this.env.frontendUrl.startsWith("https://");
    reply.setCookie(this.env.sessionCookieName, session.id, {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
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
