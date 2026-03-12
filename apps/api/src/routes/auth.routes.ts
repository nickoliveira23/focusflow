import type { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller.js";

export async function registerAuthRoutes(app: FastifyInstance, controller: AuthController) {
  app.get("/api/auth/me", async (request) => controller.getMe(request));
  app.get("/api/auth/google/start", async () => controller.startGoogleAuth());
  app.get("/api/auth/google/callback", async (request, reply) => controller.handleGoogleCallback(request, reply));
  app.post("/api/auth/logout", async (request, reply) => controller.logout(request, reply));
  app.delete("/api/auth/account", async (request, reply) => controller.deleteAccount(request, reply));
}
