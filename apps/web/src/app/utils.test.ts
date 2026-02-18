import { describe, expect, it } from "vitest";
import { formatTimeFromSeconds, getTimerStorageKey, normalizeSettings } from "./utils";

describe("utils", () => {
  it("formats mm:ss below one hour", () => {
    expect(formatTimeFromSeconds(25 * 60)).toBe("25:00");
  });

  it("formats hh:mm:ss for one hour or more", () => {
    expect(formatTimeFromSeconds(2 * 60 * 60)).toBe("02:00:00");
  });

  it("builds guest and user storage keys", () => {
    expect(getTimerStorageKey(undefined)).toMatch(/\.guest$/);
    expect(getTimerStorageKey("user-1")).toMatch(/\.user-1$/);
  });

  it("clamps settings values to valid ranges", () => {
    const normalized = normalizeSettings({
      focusMinutes: 0,
      shortBreakMinutes: 0,
      longBreakMinutes: 0,
      longBreakEvery: 0,
      immersiveFocusDarkness: 500
    });

    expect(normalized.focusMinutes).toBeGreaterThanOrEqual(1);
    expect(normalized.shortBreakMinutes).toBeGreaterThanOrEqual(1);
    expect(normalized.longBreakMinutes).toBeGreaterThanOrEqual(1);
    expect(normalized.longBreakEvery).toBeGreaterThanOrEqual(1);
    expect(normalized.immersiveFocusDarkness).toBeLessThanOrEqual(90);
  });
});
