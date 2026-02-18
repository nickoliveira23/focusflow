import path from "node:path";
import os from "node:os";
import { mkdtemp } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

describe("data integration", () => {
  let tmpDir = "";
  let app: Awaited<ReturnType<typeof buildApp>>["app"] | null = null;

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), "pomodoro-api-data-"));
    process.env.DB_PATH = path.join(tmpDir, "pomodoro.sqlite");
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

  it("scopes settings by authenticated user", async () => {
    expect(app).not.toBeNull();
    if (!app) {
      return;
    }

    const guestUpdate = await app.inject({
      method: "PUT",
      url: "/api/settings",
      payload: { focusMinutes: 30 }
    });
    expect(guestUpdate.statusCode).toBe(200);
    expect(guestUpdate.json().focusMinutes).toBe(30);

    const guestRead = await app.inject({
      method: "GET",
      url: "/api/settings"
    });
    expect(guestRead.statusCode).toBe(200);
    expect(guestRead.json().focusMinutes).toBe(30);

    const callback = await app.inject({
      method: "GET",
      url: "/api/auth/google/callback"
    });
    const setCookieHeader = callback.headers["set-cookie"];
    const sessionCookie = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader!;
    expect(sessionCookie).toBeTruthy();

    const userUpdate = await app.inject({
      method: "PUT",
      url: "/api/settings",
      headers: {
        cookie: sessionCookie
      },
      payload: { focusMinutes: 42, focusAccent: "ocean" }
    });
    expect(userUpdate.statusCode).toBe(200);
    expect(userUpdate.json().focusMinutes).toBe(42);

    const userRead = await app.inject({
      method: "GET",
      url: "/api/settings",
      headers: {
        cookie: sessionCookie
      }
    });
    expect(userRead.statusCode).toBe(200);
    expect(userRead.json().focusMinutes).toBe(42);
    expect(userRead.json().focusAccent).toBe("ocean");

    const guestReadAfter = await app.inject({
      method: "GET",
      url: "/api/settings"
    });
    expect(guestReadAfter.statusCode).toBe(200);
    expect(guestReadAfter.json().focusMinutes).toBe(30);
  });
});
