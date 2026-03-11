import type { FastifyInstance, FastifyRequest } from "fastify";
import { SpotifyController } from "../controllers/spotify.controller.js";
import { AuthService } from "../services/auth.service.js";

async function isAuthenticated(authService: AuthService, request: FastifyRequest) {
  return Boolean(await authService.getAuthUserFromRequest(request));
}

export async function registerSpotifyRoutes(
  app: FastifyInstance,
  controller: SpotifyController,
  authService: AuthService
) {
  app.get("/api/spotify/status", async (request, reply) => {
    if (!await isAuthenticated(authService, request)) {
      return reply.code(401).send({ connected: false, authRequired: true });
    }
    return controller.getStatus();
  });

  app.post("/api/auth/spotify/start", async (request, reply) => {
    if (!await isAuthenticated(authService, request)) {
      return reply.code(401).send({ error: "AUTH_REQUIRED" });
    }
    return controller.startAuth();
  });

  app.get("/api/auth/spotify/callback", async (request, reply) => controller.handleCallback(request, reply));

  app.post("/api/auth/spotify/disconnect", async (request, reply) => {
    if (!await isAuthenticated(authService, request)) {
      return reply.code(401).send({ error: "AUTH_REQUIRED" });
    }
    return controller.disconnect();
  });

  app.get("/api/spotify/now-playing", async (request, reply) => {
    if (!await isAuthenticated(authService, request)) {
      return reply.code(401).send({ connected: false, playing: false, authRequired: true });
    }
    return controller.getNowPlaying();
  });

  app.get("/api/spotify/profile", async (request, reply) => {
    if (!await isAuthenticated(authService, request)) {
      return reply.code(401).send({ connected: false, authRequired: true });
    }
    return controller.getProfile();
  });
}
