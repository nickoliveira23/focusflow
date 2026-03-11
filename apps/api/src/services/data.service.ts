import { DEFAULT_SETTINGS } from "../config/constants.js";
import type { FocusSessionRecord, TimerSettings } from "../db.js";
import type { ReturnTypeCreateDb } from "../models/db-types.js";

export class DataService {
  constructor(private readonly db: ReturnTypeCreateDb) {}

  getSettings(userId: string) {
    return this.db.getSettings(userId, DEFAULT_SETTINGS);
  }

  updateSettings(userId: string, payload: Partial<TimerSettings>) {
    const next: TimerSettings = {
      focusMinutes: Math.max(1, Number(payload.focusMinutes ?? DEFAULT_SETTINGS.focusMinutes)),
      shortBreakMinutes: Math.max(1, Number(payload.shortBreakMinutes ?? DEFAULT_SETTINGS.shortBreakMinutes)),
      longBreakMinutes: Math.max(1, Number(payload.longBreakMinutes ?? DEFAULT_SETTINGS.longBreakMinutes)),
      longBreakEvery: Math.max(1, Number(payload.longBreakEvery ?? DEFAULT_SETTINGS.longBreakEvery)),
      ritualEnabled: Boolean(payload.ritualEnabled ?? DEFAULT_SETTINGS.ritualEnabled),
      animationsEnabled: Boolean(payload.animationsEnabled ?? DEFAULT_SETTINGS.animationsEnabled),
      focusAccent: payload.focusAccent === "ocean" ? "ocean" : "amber",
      immersiveFocusEnabled: Boolean(
        payload.immersiveFocusEnabled ?? DEFAULT_SETTINGS.immersiveFocusEnabled
      ),
      immersiveFocusFullscreen: Boolean(
        payload.immersiveFocusFullscreen ?? DEFAULT_SETTINGS.immersiveFocusFullscreen
      ),
      immersiveFocusDarkness: Math.max(
        20,
        Math.min(
          90,
          Number(payload.immersiveFocusDarkness ?? DEFAULT_SETTINGS.immersiveFocusDarkness)
        )
      ),
      immersiveFocusOnlyTimer: Boolean(
        payload.immersiveFocusOnlyTimer ?? DEFAULT_SETTINGS.immersiveFocusOnlyTimer
      )
    };

    return this.db.upsertSettings(userId, next);
  }

  insertFocusSessionsBulk(userId: string, payload: { sessions?: FocusSessionRecord[] }) {
    const incoming = payload.sessions ?? [];
    return this.db.insertFocusSessionsBulk(userId, incoming);
  }

  getStatsSummary(userId: string, range: "day" | "week" | "month") {
    return this.db.getStatsSummary(userId, range);
  }
}
