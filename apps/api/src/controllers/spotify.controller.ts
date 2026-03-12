import type { FastifyReply, FastifyRequest } from "fastify";
import { SpotifyService } from "../services/spotify.service.js";

export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  getStatus(userId: string) {
    return this.spotifyService.getStatus(userId);
  }

  startAuth(userId: string) {
    return this.spotifyService.startAuth(userId);
  }

  handleCallback(request: FastifyRequest, reply: FastifyReply) {
    return this.spotifyService.handleCallback(request, reply);
  }

  disconnect(userId: string) {
    return this.spotifyService.disconnect(userId);
  }

  getNowPlaying(userId: string) {
    return this.spotifyService.getNowPlaying(userId);
  }

  getProfile(userId: string) {
    return this.spotifyService.getProfile(userId);
  }
}
