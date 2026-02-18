import type { TimerSettings } from "../db.js";

export const DEFAULT_USER_ID = "local-dev";

export const DEFAULT_SETTINGS: TimerSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakEvery: 4,
  ritualEnabled: true,
  animationsEnabled: true,
  focusAccent: "amber",
  immersiveFocusEnabled: true,
  immersiveFocusFullscreen: false,
  immersiveFocusDarkness: 72,
  immersiveFocusOnlyTimer: false
};

export const SPOTIFY_SCOPES = [
  "user-read-currently-playing",
  "user-read-playback-state"
].join(" ");
