import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { createDb } from "./db.js";
import { getEnv } from "./config/env.js";
import { AuthService } from "./services/auth.service.js";
import { DataService } from "./services/data.service.js";
import { SpotifyService } from "./services/spotify.service.js";
import { HealthController } from "./controllers/health.controller.js";
import { DataController } from "./controllers/data.controller.js";
import { AuthController } from "./controllers/auth.controller.js";
import { SpotifyController } from "./controllers/spotify.controller.js";
import { registerHealthRoutes } from "./routes/health.routes.js";
import { registerDataRoutes } from "./routes/data.routes.js";
import { registerAuthRoutes } from "./routes/auth.routes.js";
import { registerSpotifyRoutes } from "./routes/spotify.routes.js";

export async function buildApp() {
  const env = getEnv();
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: env.frontendUrl,
    credentials: true
  });

  await app.register(cookie, {
    secret: env.cookieSecret,
    hook: "onRequest"
  });

  const db = await createDb(env.databaseUrl);

  const authService = new AuthService(db, env, app.log);
  const dataService = new DataService(db);
  const spotifyService = new SpotifyService(env, app.log);

  const healthController = new HealthController();
  const dataController = new DataController(authService, dataService);
  const authController = new AuthController(authService, spotifyService);
  const spotifyController = new SpotifyController(spotifyService);

  await registerHealthRoutes(app, healthController);
  await registerDataRoutes(app, dataController);
  await registerAuthRoutes(app, authController);
  await registerSpotifyRoutes(app, spotifyController, authService);

  return { app, env };
}
