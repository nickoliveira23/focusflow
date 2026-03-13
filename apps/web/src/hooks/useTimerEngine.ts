import { useEffect, useMemo, useRef, useState } from "react";
import type { FocusSessionRecord, PersistedTimerState, SessionMode, TimerSettings, TimerStatus } from "@/app/types";
import { createDefaultTimerState, formatTimeFromSeconds, getDurationSeconds, getTimerStorageKey } from "@/app/utils";

interface UseTimerEngineInput {
  settings: TimerSettings;
  authChecked: boolean;
  authUserId: string | undefined;
  authError: boolean;
  immersiveLocked: boolean;
  setImmersiveLocked: (locked: boolean) => void;
  onTrackEvent: (name: string, details?: Record<string, string | number | boolean>) => void;
  onFocusSessionCompleted: (session: FocusSessionRecord) => void;
}

interface UseTimerEngineResult {
  status: TimerStatus;
  mode: SessionMode;
  completedFocusSessions: number;
  remainingSeconds: number;
  endsAtMs: number | null;
  autoCycle: boolean;
  ritualActive: boolean;
  ritualRemaining: number;
  timerHydrated: boolean;
  timeLabel: string;
  canPause: boolean;
  canReset: boolean;
  startLabel: string;
  hintMessage: string;
  setAutoCycle: (checked: boolean) => void;
  setRemainingSeconds: (seconds: number) => void;
  setMode: (mode: SessionMode) => void;
  setStatus: (status: TimerStatus) => void;
  setEndsAtMs: (value: number | null) => void;
  handleStart: () => void;
  handlePause: () => void;
  handleReset: () => void;
  handleModeSelect: (nextMode: SessionMode) => void;
  realignForSettings: (nextSettings: TimerSettings) => void;
}

export function useTimerEngine({
  settings,
  authChecked,
  authUserId,
  authError,
  immersiveLocked,
  setImmersiveLocked,
  onTrackEvent,
  onFocusSessionCompleted
}: UseTimerEngineInput): UseTimerEngineResult {
  const previousAuthKeyRef = useRef<string | null>(null);

  const [status, setStatus] = useState<TimerStatus>("idle");
  const [mode, setMode] = useState<SessionMode>("focus");
  const [completedFocusSessions, setCompletedFocusSessions] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(settings.focusMinutes * 60);
  const [endsAtMs, setEndsAtMs] = useState<number | null>(null);
  const [autoCycle, setAutoCycle] = useState(true);
  const [ritualActive, setRitualActive] = useState(false);
  const [ritualRemaining, setRitualRemaining] = useState(0);
  const [timerHydrated, setTimerHydrated] = useState(false);

  const applyDefaultTimerState = (focusMinutes: number) => {
    const initial = createDefaultTimerState(focusMinutes);
    setStatus(initial.status);
    setMode(initial.mode);
    setCompletedFocusSessions(initial.completedFocusSessions);
    setRemainingSeconds(initial.remainingSeconds);
    setEndsAtMs(initial.endsAtMs);
    setAutoCycle(initial.autoCycle);
    setImmersiveLocked(Boolean(initial.immersiveLocked));
    setRitualActive(false);
    setRitualRemaining(0);
  };

  useEffect(() => {
    if (!authChecked) {
      return;
    }

    // When auth failed due to network error, skip hydration entirely so the
    // timer keeps running with its current state instead of resetting.
    if (authError && !authUserId) {
      if (!timerHydrated) {
        setTimerHydrated(true);
      }
      return;
    }

    const authKey = authUserId ?? "guest";
    const previousAuthKey = previousAuthKeyRef.current;
    const isAuthTransition = previousAuthKey !== null && previousAuthKey !== authKey;
    previousAuthKeyRef.current = authKey;

    setTimerHydrated(false);

    // Force-reset timer when login/logout/account switch happens.
    if (isAuthTransition) {
      applyDefaultTimerState(settings.focusMinutes);
      setTimerHydrated(true);
      return;
    }

    try {
      const rawTimer = window.localStorage.getItem(getTimerStorageKey(authUserId));
      if (!rawTimer) {
        applyDefaultTimerState(settings.focusMinutes);
      } else {
        const parsed = JSON.parse(rawTimer) as PersistedTimerState;
        setMode(parsed.mode);
        setCompletedFocusSessions(parsed.completedFocusSessions);
        setAutoCycle(parsed.autoCycle);
        setImmersiveLocked(Boolean(parsed.immersiveLocked));

        if (parsed.status === "running" && parsed.endsAtMs !== null) {
          const next = Math.max(0, Math.ceil((parsed.endsAtMs - Date.now()) / 1000));
          if (next > 0) {
            setStatus("running");
            setEndsAtMs(parsed.endsAtMs);
            setRemainingSeconds(next);
          } else {
            setStatus("completed");
            setEndsAtMs(null);
            setRemainingSeconds(0);
          }
        } else {
          setStatus(parsed.status);
          setEndsAtMs(parsed.endsAtMs);
          setRemainingSeconds(parsed.remainingSeconds);
        }
      }
    } catch {
      applyDefaultTimerState(settings.focusMinutes);
    } finally {
      setTimerHydrated(true);
    }
  }, [authChecked, authError, authUserId, setImmersiveLocked]);

  useEffect(() => {
    if (!authChecked || !timerHydrated) {
      return;
    }
    const payload: PersistedTimerState = {
      status,
      mode,
      completedFocusSessions,
      remainingSeconds,
      endsAtMs,
      autoCycle,
      immersiveLocked
    };
    window.localStorage.setItem(getTimerStorageKey(authUserId), JSON.stringify(payload));
  }, [status, mode, completedFocusSessions, remainingSeconds, endsAtMs, autoCycle, immersiveLocked, authUserId, authChecked, timerHydrated]);

  useEffect(() => {
    if (status !== "running" || endsAtMs === null) {
      return;
    }

    const updateFromClock = () => {
      const next = Math.max(0, Math.ceil((endsAtMs - Date.now()) / 1000));
      setRemainingSeconds(next);
      if (next === 0) {
        if (autoCycle) {
          if (mode === "focus") {
            const nextCompleted = completedFocusSessions + 1;
            const session: FocusSessionRecord = {
              id: crypto.randomUUID(),
              completedAtIso: new Date().toISOString(),
              durationSeconds: settings.focusMinutes * 60,
              status: "completed"
            };
            onFocusSessionCompleted(session);
            onTrackEvent("timer_completed", { mode: "focus", duration_seconds: session.durationSeconds });
            const breakMode =
              nextCompleted % settings.longBreakEvery === 0
                ? "long_break"
                : "short_break";
            const breakDuration = getDurationSeconds(breakMode, settings);
            setCompletedFocusSessions(nextCompleted);
            setMode(breakMode);
            setRemainingSeconds(breakDuration);
            setEndsAtMs(Date.now() + breakDuration * 1000);
            return;
          }

          const nextFocusDuration = getDurationSeconds("focus", settings);
          setMode("focus");
          setRemainingSeconds(nextFocusDuration);
          setEndsAtMs(Date.now() + nextFocusDuration * 1000);
          return;
        }

        setStatus("completed");
        setEndsAtMs(null);
      }
    };

    updateFromClock();
    const interval = window.setInterval(updateFromClock, 250);
    return () => window.clearInterval(interval);
  }, [status, endsAtMs, autoCycle, mode, completedFocusSessions, settings, onFocusSessionCompleted, onTrackEvent]);

  useEffect(() => {
    if (status !== "running" || endsAtMs === null) {
      return;
    }

    const reconcileOnVisibility = () => {
      if (document.visibilityState !== "visible") {
        return;
      }
      const next = Math.max(0, Math.ceil((endsAtMs - Date.now()) / 1000));
      setRemainingSeconds(next);
    };

    document.addEventListener("visibilitychange", reconcileOnVisibility);
    return () => {
      document.removeEventListener("visibilitychange", reconcileOnVisibility);
    };
  }, [status, endsAtMs]);

  useEffect(() => {
    if (!ritualActive) {
      return;
    }
    if (ritualRemaining <= 0) {
      setRitualActive(false);
      setStatus("running");
      setEndsAtMs(Date.now() + remainingSeconds * 1000);
      return;
    }
    const timer = window.setTimeout(() => {
      setRitualRemaining((previous) => previous - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [ritualActive, ritualRemaining, remainingSeconds]);

  const handleStart = () => {
    if (status === "running") {
      return;
    }
    const safeRemaining =
      remainingSeconds === 0 ? getDurationSeconds(mode, settings) : remainingSeconds;
    if (remainingSeconds === 0) {
      setRemainingSeconds(safeRemaining);
    }
    const shouldRunRitual =
      settings.ritualEnabled && mode === "focus" && (status === "idle" || status === "completed");
    if (shouldRunRitual) {
      setRitualActive(true);
      setRitualRemaining(3);
      setStatus("paused");
      onTrackEvent("ritual_started");
      return;
    }
    setStatus("running");
    setImmersiveLocked(false);
    setEndsAtMs(Date.now() + safeRemaining * 1000);
    onTrackEvent("timer_started", { mode });
  };

  const handlePause = () => {
    if (status !== "running" || endsAtMs === null) {
      return;
    }
    const next = Math.max(0, Math.ceil((endsAtMs - Date.now()) / 1000));
    setRemainingSeconds(next);
    setStatus("paused");
    setEndsAtMs(null);
    onTrackEvent("timer_paused", { mode });
  };

  const handleReset = () => {
    setStatus("idle");
    setMode("focus");
    setCompletedFocusSessions(0);
    setRemainingSeconds(settings.focusMinutes * 60);
    setEndsAtMs(null);
    setRitualActive(false);
    setRitualRemaining(0);
    onTrackEvent("timer_reset", { mode });
  };

  const handleModeSelect = (nextMode: SessionMode) => {
    setMode(nextMode);
    setStatus("idle");
    setEndsAtMs(null);
    setRitualActive(false);
    setRitualRemaining(0);
    setRemainingSeconds(getDurationSeconds(nextMode, settings));
    onTrackEvent("mode_changed", { mode: nextMode });
  };

  const realignForSettings = (nextSettings: TimerSettings) => {
    if (status !== "running") {
      setRemainingSeconds(getDurationSeconds(mode, nextSettings));
      setEndsAtMs(null);
      if (status === "completed") {
        setStatus("idle");
      }
    }
  };

  const timeLabel = useMemo(() => formatTimeFromSeconds(remainingSeconds), [remainingSeconds]);

  const canPause = status === "running";
  const canReset = status !== "idle" || remainingSeconds !== settings.focusMinutes * 60;
  const startLabel = status === "paused" ? "Resume" : "Start";

  const hintMessage =
    ritualActive
      ? "Ritual active. Breathe and prepare your environment."
      : status === "running"
      ? "Timer running. Stay focused."
      : status === "paused"
        ? "Session paused. Resume when ready."
        : status === "completed"
          ? "Session complete. Great work."
          : "Ready to start your first pomodoro.";

  return {
    status,
    mode,
    completedFocusSessions,
    remainingSeconds,
    endsAtMs,
    autoCycle,
    ritualActive,
    ritualRemaining,
    timerHydrated,
    timeLabel,
    canPause,
    canReset,
    startLabel,
    hintMessage,
    setAutoCycle,
    setRemainingSeconds,
    setMode,
    setStatus,
    setEndsAtMs,
    handleStart,
    handlePause,
    handleReset,
    handleModeSelect,
    realignForSettings
  };
}
