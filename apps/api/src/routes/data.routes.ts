import type { FastifyInstance } from "fastify";
import { DataController } from "../controllers/data.controller.js";

export async function registerDataRoutes(app: FastifyInstance, controller: DataController) {
  app.get("/api/settings", async (request) => controller.getSettings(request));
  app.put("/api/settings", async (request, reply) => controller.updateSettings(request, reply));
  app.post("/api/focus-sessions/bulk", async (request) => controller.insertFocusSessionsBulk(request));
  app.get("/api/stats/summary", async (request) => controller.getStatsSummary(request));
}
