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
    const fetchSpotifyStatus = async () => {
      try {
        const response = await apiFetch("/api/spotify/status");
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
  }, []);

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
      return;
    }

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

    void fetchNowPlaying();
    const interval = window.setInterval(fetchNowPlaying, 15000);
    return () => window.clearInterval(interval);
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
    if (!SPOTIFY_ENABLED) {
      setSpotifyStatusMessage("Spotify integration is temporarily disabled (Premium required).");
      return;
    }
    try {
      await apiFetch("/api/auth/spotify/disconnect", { method: "POST" });
      setSpotifyConnected(false);
      setNowPlaying(null);
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
      if (previousUserId) {
        window.localStorage.removeItem(getTimerStorageKey(previousUserId));
      }
      window.localStorage.removeItem(getTimerStorageKey(undefined));

      // Apply local logout immediately so timer/session resets at once.
      handleReset();
      setIsImmersiveLocked(true);
      setAuthUser(null);
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




