import type { FastifyInstance } from "fastify";
import { SpotifyController } from "../controllers/spotify.controller.js";

export async function registerSpotifyRoutes(app: FastifyInstance, controller: SpotifyController) {
  app.get("/api/spotify/status", async () => controller.getStatus());
  app.post("/api/auth/spotify/start", async () => controller.startAuth());
  app.get("/api/auth/spotify/callback", async (request, reply) => controller.handleCallback(request, reply));
  app.post("/api/auth/spotify/disconnect", async () => controller.disconnect());
  app.get("/api/spotify/now-playing", async () => controller.getNowPlaying());
}
