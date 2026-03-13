import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "@/app/constants";
import { useTimerEngine } from "./useTimerEngine";

describe("useTimerEngine", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useRealTimers();
  });

  it("realigns timer when settings are saved and timer is idle", () => {
    const onTrackEvent = vi.fn();
    const onFocusSessionCompleted = vi.fn();
    const setImmersiveLocked = vi.fn();

    const { result } = renderHook(() =>
      useTimerEngine({
        settings: { ...DEFAULT_SETTINGS, ritualEnabled: false },
        authChecked: true,
        authUserId: undefined,
        authError: false,
        immersiveLocked: false,
        setImmersiveLocked,
        onTrackEvent,
        onFocusSessionCompleted
      })
    );

    act(() => {
      result.current.realignForSettings({
        ...DEFAULT_SETTINGS,
        focusMinutes: 40
      });
    });

    expect(result.current.remainingSeconds).toBe(40 * 60);
  });

  it("does not overwrite running timer when settings change", () => {
    const onTrackEvent = vi.fn();
    const onFocusSessionCompleted = vi.fn();
    const setImmersiveLocked = vi.fn();

    const { result } = renderHook(() =>
      useTimerEngine({
        settings: { ...DEFAULT_SETTINGS, ritualEnabled: false },
        authChecked: true,
        authUserId: undefined,
        authError: false,
        immersiveLocked: false,
        setImmersiveLocked,
        onTrackEvent,
        onFocusSessionCompleted
      })
    );

    act(() => {
      result.current.handleStart();
    });

    const before = result.current.remainingSeconds;
    act(() => {
      result.current.realignForSettings({
        ...DEFAULT_SETTINGS,
        focusMinutes: 50
      });
    });

    expect(result.current.status).toBe("running");
    expect(result.current.remainingSeconds).toBeLessThanOrEqual(before);
    expect(result.current.remainingSeconds).not.toBe(50 * 60);
  });
});
