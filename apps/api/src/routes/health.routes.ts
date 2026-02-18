import type { FastifyInstance } from "fastify";
import { HealthController } from "../controllers/health.controller.js";

export async function registerHealthRoutes(app: FastifyInstance, controller: HealthController) {
  app.get("/health", async () => controller.getHealth());
}
