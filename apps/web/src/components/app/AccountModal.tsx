import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { AccountView, NowPlayingResponse } from "@/app/types";

interface AccountModalProps {
  accountView: AccountView;
  accountViewTitle: string;
  authUser: { name: string; email: string } | null;
  syncQueueLength: number;
  lastSyncAtIso: string | null;
  analyticsEventsLength: number;
  spotifyEnabled: boolean;
  spotifyConnected: boolean;
  spotifyStatusMessage: string;
  nowPlaying: NowPlayingResponse | null;
  onClose: () => void;
  onLogout: () => void;
  onLogin: () => void;
  onSpotifyConnect: () => void;
  onSpotifyDisconnect: () => void;
}

export function AccountModal({
  accountView,
  accountViewTitle,
  authUser,
  syncQueueLength,
  lastSyncAtIso,
  analyticsEventsLength,
  spotifyEnabled,
  spotifyConnected,
  spotifyStatusMessage,
  nowPlaying,
  onClose,
  onLogout,
  onLogin,
  onSpotifyConnect,
  onSpotifyDisconnect
}: AccountModalProps) {
  return (
    <Dialog open={Boolean(accountView)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="modal-card">
        <div className="modal-header">
          <h2>{accountViewTitle}</h2>
        </div>
        {accountView === "account" ? (
          <div className="account-view">
            <p className="sync-status">Auth: {authUser ? `Logged in as ${authUser.email}` : "Not authenticated"}</p>
            <p className="sync-status">Queue: {syncQueueLength} pending items</p>
            <p className="sync-status">Last sync: {lastSyncAtIso ? new Date(lastSyncAtIso).toLocaleString() : "not synced yet"}</p>
            <p className="sync-status">Events tracked: {analyticsEventsLength}</p>
          </div>
        ) : null}
        {accountView === "profile" ? (
          <div className="account-view">
            <p className="sync-status">Name: {authUser?.name ?? "Guest"}</p>
            <p className="sync-status">Email: {authUser?.email ?? "Not available in guest mode"}</p>
            <p className="sync-status">Provider: {authUser ? "Google" : "Guest mode"}</p>
          </div>
        ) : null}
        {accountView === "premium" ? (
          <div className="account-view">
            <section className="spotify-panel" aria-label="Spotify integration">
              <h2>Spotify</h2>
              <div className="spotify-actions">
                <Button type="button" variant="outline" onClick={onSpotifyConnect} disabled={!spotifyEnabled || spotifyConnected}>
                  Connect Spotify
                </Button>
                <Button type="button" variant="outline" onClick={onSpotifyDisconnect} disabled={!spotifyEnabled || !spotifyConnected}>
                  Disconnect
                </Button>
              </div>
              {!spotifyEnabled ? (
                <p className="spotify-status">Spotify temporarily disabled until Premium is available.</p>
              ) : null}
              <p className="spotify-status">{spotifyStatusMessage}</p>
              {nowPlaying?.playing && nowPlaying.track ? (
                <p className="spotify-track">
                  {nowPlaying.track.title} - {nowPlaying.track.artist}
                </p>
              ) : null}
            </section>
          </div>
        ) : null}
        <div className="modal-footer">
          {authUser ? (
            <Button type="button" variant="outline" onClick={onLogout}>
              Logout
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={onLogin}>
              Login with Google
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
