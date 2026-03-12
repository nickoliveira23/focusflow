import React, { useEffect, useMemo, useState } from "react";
import { TopNav } from "@/components/app/TopNav";
import { TimerCard } from "@/components/app/TimerCard";
import { SettingsModal } from "@/components/app/SettingsModal";
import { InsightsModal } from "@/components/app/InsightsModal";
import { AccountModal } from "@/components/app/AccountModal";
import { LoginModal } from "@/components/app/LoginModal";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useImmersiveMode } from "@/hooks/useImmersiveMode";
import { useTimerEngine } from "@/hooks/useTimerEngine";
import { useSyncQueue } from "@/hooks/useSyncQueue";
import {
  DEFAULT_SETTINGS,
  FOCUS_SESSIONS_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  SPOTIFY_ENABLED
} from "@/app/constants";
import type {
  AccountView,
  FocusSessionRecord,
  NowPlayingResponse,
  SpotifyProfileResponse,
  StatsSummaryResponse,
  TimerSettings
} from "@/app/types";
import { getTimerStorageKey, isSameDay, normalizeSettings } from "@/app/utils";
import "./main.css";

export function App() {
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL ??
    (import.meta.env.DEV ? "http://localhost:3001" : "");

  if (!apiBaseUrl) {
    throw new Error("Missing VITE_API_BASE_URL in production environment.");
  }
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [draftSettings, setDraftSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [focusSessions, setFocusSessions] = useState<FocusSessionRecord[]>([]);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<NowPlayingResponse | null>(null);
  const [spotifyProfile, setSpotifyProfile] = useState<SpotifyProfileResponse["profile"] | null>(null);
  const [spotifyStatusMessage, setSpotifyStatusMessage] = useState("Spotify not connected.");
  const [serverWeekStats, setServerWeekStats] = useState<StatsSummaryResponse | null>(null);
  const [guestHydrated, setGuestHydrated] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [settingsFeedbackMessage, setSettingsFeedbackMessage] = useState<string | null>(null);
  const [accountView, setAccountView] = useState<AccountView>(null);
  const [isImmersiveLocked, setIsImmersiveLocked] = useState(false);
  const apiFetch = (path: string, init?: RequestInit) =>
    fetch(`${apiBaseUrl}${path}`, {
      credentials: "include",
      ...init
    });

  const hasPersistedTimerState = (userId?: string) => {
    try {
      return Boolean(window.localStorage.getItem(getTimerStorageKey(userId)));
    } catch {
      return false;
    }
  };

  const { authUser, setAuthUser, authChecked } = useAuthUser(apiFetch);

  const {
    syncQueue,
    analyticsEvents,
    lastSyncAtIso,
    enqueueSettingsSync,
    enqueueSessionSync,
    trackEvent
  } = useSyncQueue({ authUserId: authUser?.id, apiFetch });

  const {
    status,
    mode,
    completedFocusSessions,
    remainingSeconds,
    autoCycle,
    ritualActive,
    ritualRemaining,
    timeLabel,
    canPause,
    canReset,
    startLabel,
    hintMessage,
    setAutoCycle,
    handleStart,
    handlePause,
    handleReset,
    handleModeSelect,
    realignForSettings
  } = useTimerEngine({
    settings,
    authChecked,
    authUserId: authUser?.id,
    immersiveLocked: isImmersiveLocked,
    setImmersiveLocked: setIsImmersiveLocked,
    onTrackEvent: trackEvent,
    onFocusSessionCompleted: (session) => {
      setFocusSessions((previous) => [...previous, session]);
      enqueueSessionSync(session);
    }
  });

  const { isImmersiveActive, isImmersiveCanvas, canEnterImmersive } = useImmersiveMode({
    mode,
    status,
    settings,
    isImmersiveLocked,
    setIsImmersiveLocked
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const spotifyState = params.get("spotify");
    const authState = params.get("auth");
    const authProvider = params.get("provider");
    if (spotifyState === "connected") {
      setSpotifyStatusMessage("Spotify connected successfully.");
    } else if (spotifyState === "error" || spotifyState === "token_error") {
      setSpotifyStatusMessage("Spotify connection failed. Try again.");
    } else if (spotifyState === "invalid_state") {
      setSpotifyStatusMessage("Spotify state invalid. Start connect again.");
    }
    if (authState === "connected" && authProvider === "google") {
      trackEvent("google_login_success");
    }
    if (spotifyState) {
      params.delete("spotify");
    }
    if (authState) {
      params.delete("auth");
      params.delete("provider");
    }
    const next = params.toString();
    window.history.replaceState({}, "", next ? `?${next}` : window.location.pathname);
  }, []);

  useEffect(() => {
    const fetchServerSettings = async () => {
      if (!authUser) {
        return;
      }

      try {
        const response = await apiFetch("/api/settings");
        if (!response.ok) {
          return;
        }
        const payload = normalizeSettings((await response.json()) as Partial<TimerSettings>);
        setSettings(payload);
        setDraftSettings(payload);
        if (!hasPersistedTimerState(authUser.id)) {
          realignForSettings(payload);
        }
      } catch {
        // Keep local settings when server is unavailable.
      }
    };

    void fetchServerSettings();
  }, [authUser?.id]);

  useEffect(() => {
    if (!authUser) {
      setSpotifyConnected(false);
      setNowPlaying(null);
      setSpotifyProfile(null);
      setSpotifyStatusMessage("Login with Google to use Spotify integration.");
      return;
    }

    const fetchSpotifyStatus = async () => {
      try {
        const response = await apiFetch("/api/spotify/status");
        if (response.status === 401) {
          setSpotifyConnected(false);
          setNowPlaying(null);
          setSpotifyProfile(null);
          setSpotifyStatusMessage("Login with Google to use Spotify integration.");
          return;
        }
        const payload = (await response.json()) as { connected: boolean; mock?: boolean };
        setSpotifyConnected(payload.connected);
        if (payload.mock) {
          setSpotifyStatusMessage(
            payload.connected
              ? "Spotify mock mode connected."
              : "Spotify mock mode enabled. Connect to simulate."
          );
          return;
        }
        if (payload.connected) {
          setSpotifyStatusMessage("Spotify connected.");
        }
      } catch {
        // Keep default message.
      }
    };
    void fetchSpotifyStatus();
  }, [authUser?.id]);

  useEffect(() => {
    if (authUser) {
      setGuestHydrated(false);
      return;
    }
    setGuestHydrated(false);
    try {
      const rawSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      const nextSettings = rawSettings
        ? normalizeSettings(JSON.parse(rawSettings) as Partial<TimerSettings>)
        : DEFAULT_SETTINGS;
      setSettings(nextSettings);
      setDraftSettings(nextSettings);
      if (!hasPersistedTimerState(undefined)) {
        realignForSettings(nextSettings);
      }

      const rawSessions = window.localStorage.getItem(FOCUS_SESSIONS_STORAGE_KEY);
      setFocusSessions(rawSessions ? (JSON.parse(rawSessions) as FocusSessionRecord[]) : []);
    } catch {
      setSettings(DEFAULT_SETTINGS);
      setDraftSettings(DEFAULT_SETTINGS);
      if (!hasPersistedTimerState(undefined)) {
        realignForSettings(DEFAULT_SETTINGS);
      }
      setFocusSessions([]);
    } finally {
      setGuestHydrated(true);
    }
  }, [authUser?.id]);

  useEffect(() => {
    if (authUser || !guestHydrated) {
      return;
    }
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings, authUser, guestHydrated]);

  useEffect(() => {
    if (authUser || !guestHydrated) {
      return;
    }
    window.localStorage.setItem(FOCUS_SESSIONS_STORAGE_KEY, JSON.stringify(focusSessions));
  }, [focusSessions, authUser, guestHydrated]);

  useEffect(() => {
    const fetchServerStats = async () => {
      try {
        const response = await apiFetch("/api/stats/summary?range=week");
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as StatsSummaryResponse;
        setServerWeekStats(payload);
      } catch {
        // Ignore stats fetch failures.
      }
    };

    void fetchServerStats();
    const interval = window.setInterval(fetchServerStats, 20000);
    return () => window.clearInterval(interval);
  }, [lastSyncAtIso]);

  useEffect(() => {
    if (!spotifyConnected) {
      setSpotifyProfile(null);
      return;
    }

    let intervalId: number | undefined;

    const fetchNowPlaying = async () => {
      try {
        const response = await apiFetch("/api/spotify/now-playing");
        const payload = (await response.json()) as NowPlayingResponse;
        setNowPlaying(payload);
        if (!payload.connected) {
          setSpotifyConnected(false);
          setSpotifyStatusMessage("Spotify disconnected.");
          return;
        }
        if (payload.playing && payload.track) {
          setSpotifyStatusMessage(`Now playing: ${payload.track.title} - ${payload.track.artist}`);
        } else {
          setSpotifyStatusMessage("Spotify connected. No track playing.");
        }
      } catch {
        setSpotifyStatusMessage("Could not fetch now playing.");
      }
    };

    const pollMs = document.visibilityState === "visible" ? 5000 : 12000;
    void fetchNowPlaying();
    intervalId = window.setInterval(fetchNowPlaying, pollMs);

    const handleVisibilityChange = () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
      const nextPollMs = document.visibilityState === "visible" ? 5000 : 12000;
      intervalId = window.setInterval(fetchNowPlaying, nextPollMs);
      void fetchNowPlaying();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [spotifyConnected]);

  useEffect(() => {
    if (!spotifyConnected) {
      return;
    }

    const fetchSpotifyProfile = async () => {
      try {
        const response = await apiFetch("/api/spotify/profile");
        const payload = (await response.json()) as SpotifyProfileResponse;
        setSpotifyProfile(payload.profile ?? null);
      } catch {
        setSpotifyProfile(null);
      }
    };

    void fetchSpotifyProfile();
  }, [spotifyConnected]);

  const handleApplySettings = () => {
    const normalized = normalizeSettings(draftSettings);
    setSettings(normalized);
    enqueueSettingsSync(normalized);
    trackEvent("settings_saved");
    realignForSettings(normalized);
    setSettingsFeedbackMessage("Settings saved.");
    setIsSettingsOpen(false);
  };

  const handleDraftSettingsChange = (next: TimerSettings) => {
    const normalized = normalizeSettings(next);
    setDraftSettings(normalized);
  };

  const handleResetDefaultSettings = () => {
    const defaults = normalizeSettings(DEFAULT_SETTINGS);
    setDraftSettings(defaults);
    setSettings(defaults);
    enqueueSettingsSync(defaults);
    trackEvent("settings_reset_default");
    realignForSettings(defaults);
    setSettingsFeedbackMessage("Default settings applied.");
  };

  useEffect(() => {
    if (!settingsFeedbackMessage) {
      return;
    }
    const timeout = window.setTimeout(() => {
      setSettingsFeedbackMessage(null);
    }, 1800);
    return () => window.clearTimeout(timeout);
  }, [settingsFeedbackMessage]);

  const handleSpotifyConnect = async () => {
    if (!authUser) {
      setSpotifyStatusMessage("Login with Google to connect Spotify.");
      return;
    }
    if (!SPOTIFY_ENABLED) {
      setSpotifyStatusMessage("Spotify integration is temporarily disabled (Premium required).");
      return;
    }
    try {
      const response = await apiFetch("/api/auth/spotify/start", { method: "POST" });
      const payload = (await response.json()) as { authUrl?: string };
      if (!payload.authUrl) {
        setSpotifyStatusMessage("Could not start Spotify auth.");
        return;
      }
      window.location.href = payload.authUrl;
    } catch {
      setSpotifyStatusMessage("Could not connect Spotify.");
    }
  };

  const handleSpotifyDisconnect = async () => {
    if (!authUser) {
      setSpotifyStatusMessage("Login with Google to manage Spotify connection.");
      return;
    }
    if (!SPOTIFY_ENABLED) {
      setSpotifyStatusMessage("Spotify integration is temporarily disabled (Premium required).");
      return;
    }
    try {
      await apiFetch("/api/auth/spotify/disconnect", { method: "POST" });
      setSpotifyConnected(false);
      setNowPlaying(null);
      setSpotifyProfile(null);
      setSpotifyStatusMessage("Spotify disconnected.");
    } catch {
      setSpotifyStatusMessage("Could not disconnect Spotify.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await apiFetch("/api/auth/google/start");
      const payload = (await response.json()) as { authUrl?: string };
      if (!payload.authUrl) {
        return;
      }
      window.location.href = payload.authUrl;
    } catch {
      // noop
    }
  };

  const handleLogout = async () => {
    const previousUserId = authUser?.id;
    try {
      if (authUser) {
        try {
          await apiFetch("/api/auth/spotify/disconnect", { method: "POST" });
        } catch {
          // Ignore spotify disconnect failures during logout.
        }
      }

      if (previousUserId) {
        window.localStorage.removeItem(getTimerStorageKey(previousUserId));
      }
      window.localStorage.removeItem(getTimerStorageKey(undefined));

      // Apply local logout immediately so timer/session resets at once.
      handleReset();
      setIsImmersiveLocked(true);
      setAuthUser(null);
      setSpotifyConnected(false);
      setNowPlaying(null);
      setSpotifyProfile(null);
      setSpotifyStatusMessage("Login with Google to use Spotify integration.");
      setServerWeekStats(null);
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // noop
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const sessionsToday = focusSessions.filter((session) =>
      isSameDay(new Date(session.completedAtIso), now)
    );

    const sessionsWeek = focusSessions.filter(
      (session) => new Date(session.completedAtIso) >= sevenDaysAgo
    );

    const totalTodaySeconds = sessionsToday.reduce(
      (total, session) => total + session.durationSeconds,
      0
    );
    const totalWeekSeconds = sessionsWeek.reduce(
      (total, session) => total + session.durationSeconds,
      0
    );

    return {
      sessionsToday: sessionsToday.length,
      sessionsWeek: sessionsWeek.length,
      focusedTodayMinutes: Math.floor(totalTodaySeconds / 60),
      focusedWeekMinutes: Math.floor(totalWeekSeconds / 60)
    };
  }, [focusSessions]);

  const accountViewTitle =
    accountView === "profile"
      ? "Profile"
      : accountView === "premium"
        ? "Pomodoro Premium"
        : "Account";

  return (
    <main
      className={`app-shell shell-mode-${mode} shell-accent-${settings.focusAccent} ${isImmersiveActive ? "immersive-active" : ""}`}
      style={{ ["--immersive-darkness" as string]: String(settings.immersiveFocusDarkness / 100) }}
    >
      <div className="app-frame">
        <TopNav
          authUser={authUser ?? null}
          focusAccent={settings.focusAccent}
          mode={mode}
          onOpenInsights={() => setIsInsightsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAccount={() => setAccountView("account")}
          onOpenProfile={() => setAccountView("profile")}
          onOpenPremium={() => setAccountView("premium")}
          onLogout={() => void handleLogout()}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
        />
        <TimerCard
          mode={mode}
          settings={settings}
          status={status}
          timeLabel={timeLabel}
          completedFocusSessions={completedFocusSessions}
          spotifyEnabled={SPOTIFY_ENABLED && Boolean(authUser)}
          spotifyConnected={spotifyConnected}
          nowPlaying={nowPlaying}
          spotifyStatusMessage={spotifyStatusMessage}
          spotifyProfile={spotifyProfile ?? null}
          ritualActive={ritualActive}
          ritualRemaining={ritualRemaining}
          autoCycle={autoCycle}
          startLabel={startLabel}
          canPause={canPause}
          canReset={canReset}
          hintMessage={hintMessage}
          isImmersiveActive={isImmersiveActive}
          isImmersiveCanvas={isImmersiveCanvas}
          canEnterImmersive={canEnterImmersive}
          onEnterImmersive={() => setIsImmersiveLocked(false)}
          onExitImmersive={() => setIsImmersiveLocked(true)}
          onModeSelect={handleModeSelect}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          onAutoCycleChange={setAutoCycle}
        />
        {SPOTIFY_ENABLED && !isImmersiveActive && Boolean(authUser) ? (
          <footer className={`spotify-footer-card ${spotifyConnected ? "is-connected" : "is-offline"}`} aria-live="polite">
            <div className="spotify-footer-left">
              <div className="spotify-footer-brand">
                <svg className="spotify-footer-logo" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                <span>Spotify</span>
              </div>
              {spotifyConnected ? (
                nowPlaying?.playing && nowPlaying.track ? (
                  <p className="spotify-footer-track">
                    {nowPlaying.track.title} - {nowPlaying.track.artist}
                  </p>
                ) : (
                  <p className="spotify-footer-status">Connected. Nothing is playing right now.</p>
                )
              ) : (
                <p className="spotify-footer-status">Disconnected. Connect in Account &gt; Pomodoro Premium.</p>
              )}
            </div>
            <div className="spotify-footer-profile">
              {spotifyConnected && spotifyProfile?.avatarUrl ? (
                <img
                  src={spotifyProfile.avatarUrl}
                  alt={spotifyProfile.displayName || "Spotify profile"}
                  className="spotify-footer-avatar"
                  referrerPolicy="no-referrer"
                />
              ) : null}
            </div>
          </footer>
        ) : null}
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={draftSettings}
        onClose={() => {
          setDraftSettings(settings);
          realignForSettings(settings);
          setIsSettingsOpen(false);
          setSettingsFeedbackMessage(null);
        }}
        onSettingsChange={handleDraftSettingsChange}
        onSave={handleApplySettings}
        onResetDefaults={handleResetDefaultSettings}
        feedbackMessage={settingsFeedbackMessage}
      />

      <InsightsModal
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
        stats={stats}
        serverWeekStats={serverWeekStats}
      />

      <AccountModal
        accountView={accountView}
        accountViewTitle={accountViewTitle}
        authUser={authUser ? { name: authUser.name, email: authUser.email } : null}
        syncQueueLength={syncQueue.length}
        lastSyncAtIso={lastSyncAtIso}
        analyticsEventsLength={analyticsEvents.length}
        spotifyEnabled={SPOTIFY_ENABLED}
        spotifyConnected={spotifyConnected}
        spotifyStatusMessage={spotifyStatusMessage}
        nowPlaying={nowPlaying}
        onClose={() => setAccountView(null)}
        onLogout={() => {
          setAccountView(null);
          void handleLogout();
        }}
        onLogin={() => {
          setAccountView(null);
          void handleGoogleLogin();
        }}
        onSpotifyConnect={() => {
          void handleSpotifyConnect();
        }}
        onSpotifyDisconnect={() => {
          void handleSpotifyDisconnect();
        }}
      />

      <LoginModal
        isOpen={!authUser && isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onGoogleLogin={() => {
          setIsLoginModalOpen(false);
          void handleGoogleLogin();
        }}
      />
    </main>
  );
}




