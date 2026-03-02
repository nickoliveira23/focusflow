export type TimerStatus = "idle" | "running" | "paused" | "completed";
export type SessionMode = "focus" | "short_break" | "long_break";
export type FocusAccent = "amber" | "ocean";

export interface TimerSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakEvery: number;
  ritualEnabled: boolean;
  animationsEnabled: boolean;
  focusAccent: FocusAccent;
  immersiveFocusEnabled: boolean;
  immersiveFocusFullscreen: boolean;
  immersiveFocusDarkness: number;
  immersiveFocusOnlyTimer: boolean;
}

export interface FocusSessionRecord {
  id: string;
  completedAtIso: string;
  durationSeconds: number;
  status: "completed";
}

export interface NowPlayingResponse {
  connected: boolean;
  playing: boolean;
  track?: {
    title: string;
    artist: string;
  };
}

export interface SpotifyProfileResponse {
  connected: boolean;
  profile?: {
    displayName: string;
    avatarUrl?: string;
  };
}

export type SyncQueueItem =
  | { id: string; type: "settings"; payload: TimerSettings }
  | { id: string; type: "session"; payload: FocusSessionRecord };

export interface AnalyticsEvent {
  id: string;
  name: string;
  atIso: string;
  details?: Record<string, string | number | boolean>;
}

export interface StatsSummaryResponse {
  range: "day" | "week" | "month";
  sessions: number;
  focusedMinutes: number;
}

export interface AuthMeResponse {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string;
  };
}

export interface PersistedTimerState {
  status: TimerStatus;
  mode: SessionMode;
  completedFocusSessions: number;
  remainingSeconds: number;
  endsAtMs: number | null;
  autoCycle: boolean;
  immersiveLocked?: boolean;
}

export type AccountView = "account" | "profile" | "premium" | null;
