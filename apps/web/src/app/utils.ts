import { DEFAULT_SETTINGS, TIMER_STORAGE_KEY } from "./constants";
import type { PersistedTimerState, SessionMode, TimerSettings } from "./types";

export function formatTimeFromSeconds(totalSeconds: number): string {
  const hh = Math.floor(totalSeconds / 3600);
  const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");
  if (hh > 0) {
    return `${String(hh).padStart(2, "0")}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

export function getDurationSeconds(mode: SessionMode, settings: TimerSettings): number {
  if (mode === "short_break") {
    return settings.shortBreakMinutes * 60;
  }
  if (mode === "long_break") {
    return settings.longBreakMinutes * 60;
  }
  return settings.focusMinutes * 60;
}

export function getModeLabel(mode: SessionMode): string {
  if (mode === "short_break") {
    return "Short Break";
  }
  if (mode === "long_break") {
    return "Long Break";
  }
  return "Focus Session";
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function normalizeSettings(input: Partial<TimerSettings> | null | undefined): TimerSettings {
  return {
    focusMinutes: Math.max(1, input?.focusMinutes ?? DEFAULT_SETTINGS.focusMinutes),
    shortBreakMinutes: Math.max(1, input?.shortBreakMinutes ?? DEFAULT_SETTINGS.shortBreakMinutes),
    longBreakMinutes: Math.max(1, input?.longBreakMinutes ?? DEFAULT_SETTINGS.longBreakMinutes),
    longBreakEvery: Math.max(1, input?.longBreakEvery ?? DEFAULT_SETTINGS.longBreakEvery),
    ritualEnabled: input?.ritualEnabled ?? DEFAULT_SETTINGS.ritualEnabled,
    animationsEnabled: input?.animationsEnabled ?? DEFAULT_SETTINGS.animationsEnabled,
    focusAccent: input?.focusAccent ?? DEFAULT_SETTINGS.focusAccent,
    immersiveFocusEnabled: input?.immersiveFocusEnabled ?? DEFAULT_SETTINGS.immersiveFocusEnabled,
    immersiveFocusFullscreen:
      input?.immersiveFocusFullscreen ?? DEFAULT_SETTINGS.immersiveFocusFullscreen,
    immersiveFocusDarkness: Math.max(
      20,
      Math.min(90, Number(input?.immersiveFocusDarkness ?? DEFAULT_SETTINGS.immersiveFocusDarkness))
    ),
    immersiveFocusOnlyTimer:
      input?.immersiveFocusOnlyTimer ?? DEFAULT_SETTINGS.immersiveFocusOnlyTimer
  };
}

export function getTimerStorageKey(userId: string | undefined | null): string {
  return userId ? `${TIMER_STORAGE_KEY}.${userId}` : `${TIMER_STORAGE_KEY}.guest`;
}

export function createDefaultTimerState(focusMinutes: number): PersistedTimerState {
  return {
    status: "idle",
    mode: "focus",
    completedFocusSessions: 0,
    remainingSeconds: focusMinutes * 60,
    endsAtMs: null,
    autoCycle: true,
    immersiveLocked: false
  };
}
