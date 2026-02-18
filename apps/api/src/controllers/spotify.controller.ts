import type { FastifyReply, FastifyRequest } from "fastify";
import { SpotifyService } from "../services/spotify.service.js";

export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  getStatus() {
    return this.spotifyService.getStatus();
  }

  startAuth() {
    return this.spotifyService.startAuth();
  }

  handleCallback(request: FastifyRequest, reply: FastifyReply) {
    return this.spotifyService.handleCallback(request, reply);
  }

  disconnect() {
    return this.spotifyService.disconnect();
  }

  getNowPlaying() {
    return this.spotifyService.getNowPlaying();
  }
}
