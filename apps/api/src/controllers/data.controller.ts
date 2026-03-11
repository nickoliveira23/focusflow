import type { FastifyReply, FastifyRequest } from "fastify";
import type { FocusSessionRecord, TimerSettings } from "../db.js";
import { AuthService } from "../services/auth.service.js";
import { DataService } from "../services/data.service.js";

export class DataController {
  constructor(
    private readonly authService: AuthService,
    private readonly dataService: DataService
  ) {}

  async getSettings(request: FastifyRequest) {
    return this.dataService.getSettings(await this.authService.resolveUserId(request));
  }

  async updateSettings(request: FastifyRequest, reply: FastifyReply) {
    const payload = request.body as Partial<TimerSettings>;
    const saved = await this.dataService.updateSettings(await this.authService.resolveUserId(request), payload);
    return reply.send(saved);
  }

  async insertFocusSessionsBulk(request: FastifyRequest) {
    const payload = request.body as { sessions?: FocusSessionRecord[] };
    return this.dataService.insertFocusSessionsBulk(await this.authService.resolveUserId(request), payload);
  }

  async getStatsSummary(request: FastifyRequest) {
    const query = request.query as { range?: "day" | "week" | "month" };
    const range = query.range ?? "day";
    return this.dataService.getStatsSummary(await this.authService.resolveUserId(request), range);
  }
}
