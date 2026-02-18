import { useEffect, useMemo } from "react";
import type { SessionMode, TimerSettings, TimerStatus } from "@/app/types";

interface UseImmersiveModeInput {
  mode: SessionMode;
  status: TimerStatus;
  settings: TimerSettings;
  isImmersiveLocked: boolean;
  setIsImmersiveLocked: (locked: boolean) => void;
}

interface UseImmersiveModeResult {
  isImmersiveActive: boolean;
  isImmersiveCanvas: boolean;
  canEnterImmersive: boolean;
}

export function useImmersiveMode({
  mode,
  status,
  settings,
  isImmersiveLocked,
  setIsImmersiveLocked
}: UseImmersiveModeInput): UseImmersiveModeResult {
  const isFocusRunning = mode === "focus" && status === "running";

  const isImmersiveActive = useMemo(
    () => !isImmersiveLocked && settings.immersiveFocusEnabled && isFocusRunning,
    [isImmersiveLocked, settings.immersiveFocusEnabled, isFocusRunning]
  );

  const isImmersiveCanvas = isImmersiveActive && settings.immersiveFocusOnlyTimer;

  const canEnterImmersive =
    isImmersiveLocked && settings.immersiveFocusEnabled && isFocusRunning;

  useEffect(() => {
    if (!isImmersiveActive) {
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => undefined);
      }
      return;
    }

    if (settings.immersiveFocusFullscreen && !document.fullscreenElement) {
      void document.documentElement.requestFullscreen().catch(() => undefined);
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsImmersiveLocked(true);
      }
    };
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("keydown", onEscape);
    };
  }, [isImmersiveActive, settings.immersiveFocusFullscreen, setIsImmersiveLocked]);

  useEffect(() => {
    if (!isFocusRunning) {
      setIsImmersiveLocked(false);
    }
  }, [isFocusRunning, setIsImmersiveLocked]);

  return {
    isImmersiveActive,
    isImmersiveCanvas,
    canEnterImmersive
  };
}
