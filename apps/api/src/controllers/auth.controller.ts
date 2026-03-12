import type { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "../services/auth.service.js";
import { SpotifyService } from "../services/spotify.service.js";

export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly spotifyService: SpotifyService
  ) {}

  getMe(request: FastifyRequest) {
    return this.authService.getMe(request);
  }

  startGoogleAuth() {
    return this.authService.startGoogleAuth();
  }

  handleGoogleCallback(request: FastifyRequest, reply: FastifyReply) {
    return this.authService.handleGoogleCallback(request, reply);
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const user = await this.authService.getAuthUserFromRequest(request);
    if (user) {
      await this.spotifyService.disconnect(user.id);
    }
    return this.authService.logout(request, reply);
  }

  async deleteAccount(request: FastifyRequest, reply: FastifyReply) {
    return this.authService.deleteAccount(request, reply);
  }
}
