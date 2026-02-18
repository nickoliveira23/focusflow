export interface TimerSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakEvery: number;
  ritualEnabled: boolean;
  animationsEnabled: boolean;
  focusAccent: "amber" | "ocean";
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

export interface AuthUser {
  id: string;
  googleSub: string;
  email: string;
  name: string;
  avatarUrl: string;
}
