import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

describe("auth integration", () => {
  let app: Awaited<ReturnType<typeof buildApp>>["app"] | null = null;

  beforeEach(async () => {
    if (!process.env.DATABASE_URL) {
      return;
    }
    process.env.GOOGLE_MOCK = "true";
    process.env.SPOTIFY_MOCK = "true";
    process.env.FRONTEND_URL = "http://localhost:5173";

    const built = await buildApp();
    app = built.app;
    await app.ready();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
      app = null;
    }
  });

  it("creates session in google mock callback and allows logout", async () => {
    if (!process.env.DATABASE_URL) {
      return;
    }
    expect(app).not.toBeNull();
    if (!app) {
      return;
    }

    const before = await app.inject({
      method: "GET",
      url: "/api/auth/me"
    });
    expect(before.statusCode).toBe(200);
    expect(before.json()).toEqual({ authenticated: false });

    const callback = await app.inject({
      method: "GET",
      url: "/api/auth/google/callback"
    });
    expect(callback.statusCode).toBe(302);
    expect(callback.headers.location).toContain("auth=connected");

    const setCookieHeader = callback.headers["set-cookie"];
    expect(setCookieHeader).toBeDefined();
    const sessionCookie = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader!;

    const me = await app.inject({
      method: "GET",
      url: "/api/auth/me",
      headers: {
        cookie: sessionCookie
      }
    });
    expect(me.statusCode).toBe(200);
    expect(me.json().authenticated).toBe(true);

    const logout = await app.inject({
      method: "POST",
      url: "/api/auth/logout",
      headers: {
        cookie: sessionCookie
      }
    });
    expect(logout.statusCode).toBe(200);
    expect(logout.json()).toEqual({ success: true });
  });
});
