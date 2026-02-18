import type { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "../services/auth.service.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  getMe(request: FastifyRequest) {
    return this.authService.getMe(request);
  }

  startGoogleAuth() {
    return this.authService.startGoogleAuth();
  }

  handleGoogleCallback(request: FastifyRequest, reply: FastifyReply) {
    return this.authService.handleGoogleCallback(request, reply);
  }

  logout(request: FastifyRequest, reply: FastifyReply) {
    return this.authService.logout(request, reply);
  }
}
