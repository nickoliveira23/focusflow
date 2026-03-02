import type { FocusAccent, TimerSettings } from "./types";

export const DEFAULT_SETTINGS: TimerSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakEvery: 4,
  ritualEnabled: true,
  animationsEnabled: true,
  focusAccent: "amber" as FocusAccent,
  immersiveFocusEnabled: true,
  immersiveFocusFullscreen: false,
  immersiveFocusDarkness: 72,
  immersiveFocusOnlyTimer: false
};

export const SPOTIFY_ENABLED = import.meta.env.VITE_SPOTIFY_ENABLED !== "false";
export const TIMER_STORAGE_KEY = "pomodoro.timer.v1";
export const SETTINGS_STORAGE_KEY = "pomodoro.settings.v1";
export const FOCUS_SESSIONS_STORAGE_KEY = "pomodoro.sessions.v1";
export const SYNC_QUEUE_STORAGE_KEY = "pomodoro.sync-queue.v1";
export const EVENTS_STORAGE_KEY = "pomodoro.events.v1";
