import type { FastifyReply, FastifyRequest } from "fastify";
import type { FocusSessionRecord, TimerSettings } from "../db.js";
import { AuthService } from "../services/auth.service.js";
import { DataService } from "../services/data.service.js";

export class DataController {
  constructor(
    private readonly authService: AuthService,
    private readonly dataService: DataService
  ) {}

  getSettings(request: FastifyRequest) {
    return this.dataService.getSettings(this.authService.resolveUserId(request));
  }

  updateSettings(request: FastifyRequest, reply: FastifyReply) {
    const payload = request.body as Partial<TimerSettings>;
    const saved = this.dataService.updateSettings(this.authService.resolveUserId(request), payload);
    return reply.send(saved);
  }

  insertFocusSessionsBulk(request: FastifyRequest) {
    const payload = request.body as { sessions?: FocusSessionRecord[] };
    return this.dataService.insertFocusSessionsBulk(this.authService.resolveUserId(request), payload);
  }

  getStatsSummary(request: FastifyRequest) {
    const query = request.query as { range?: "day" | "week" | "month" };
    const range = query.range ?? "day";
    return this.dataService.getStatsSummary(this.authService.resolveUserId(request), range);
  }
}
