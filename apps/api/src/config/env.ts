import path from "node:path";

export interface AppEnv {
  port: number;
  frontendUrl: string;
  cookieSecret: string;
  dbPath: string;
  sessionCookieName: string;
  sessionTtlDays: number;
  spotifyClientId: string;
  spotifyClientSecret: string;
  spotifyRedirectUri: string;
  spotifyMock: boolean;
  googleClientId: string;
  googleClientSecret: string;
  googleRedirectUri: string;
  googleMock: boolean;
}

export function getEnv(): AppEnv {
  return {
    port: Number(process.env.PORT ?? 3001),
    frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
    cookieSecret: process.env.COOKIE_SECRET ?? "dev-cookie-secret",
    dbPath: process.env.DB_PATH ?? path.resolve(process.cwd(), "data", "pomodoro.sqlite"),
    sessionCookieName: "pomodoro_session",
    sessionTtlDays: 30,
    spotifyClientId: process.env.SPOTIFY_CLIENT_ID ?? "",
    spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
    spotifyRedirectUri: process.env.SPOTIFY_REDIRECT_URI ?? "http://localhost:3001/api/auth/spotify/callback",
    spotifyMock: process.env.SPOTIFY_MOCK === "true",
    googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    googleRedirectUri: process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:3001/api/auth/google/callback",
    googleMock: process.env.GOOGLE_MOCK === "true"
  };
}
