import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { NowPlayingResponse, SessionMode, TimerSettings, TimerStatus } from "@/app/types";
import { getModeLabel } from "@/app/utils";

interface TimerCardProps {
  mode: SessionMode;
  settings: TimerSettings;
  status: TimerStatus;
  timeLabel: string;
  completedFocusSessions: number;
  spotifyEnabled: boolean;
  spotifyConnected: boolean;
  nowPlaying: NowPlayingResponse | null;
  spotifyStatusMessage: string;
  ritualActive: boolean;
  ritualRemaining: number;
  autoCycle: boolean;
  startLabel: string;
  canPause: boolean;
  canReset: boolean;
  hintMessage: string;
  isImmersiveActive: boolean;
  isImmersiveCanvas: boolean;
  canEnterImmersive: boolean;
  onEnterImmersive: () => void;
  onExitImmersive: () => void;
  onModeSelect: (mode: SessionMode) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onAutoCycleChange: (checked: boolean) => void;
}

type FlipDigitState = {
  tick: number;
  previousChar: string;
  isFlipping: boolean;
};

const FLIP_RESET_MS = 900;

export function TimerCard({
  mode,
  settings,
  status,
  timeLabel,
  completedFocusSessions,
  spotifyEnabled,
  spotifyConnected,
  nowPlaying,
  spotifyStatusMessage,
  ritualActive,
  ritualRemaining,
  autoCycle,
  startLabel,
  canPause,
  canReset,
  hintMessage,
  isImmersiveActive,
  isImmersiveCanvas,
  canEnterImmersive,
  onEnterImmersive,
  onExitImmersive,
  onModeSelect,
  onStart,
  onPause,
  onReset,
  onAutoCycleChange
}: TimerCardProps) {
  const immersiveFlipChars = timeLabel.split("");
  const [flipState, setFlipState] = useState<Record<number, FlipDigitState>>({});
  const previousCharsRef = useRef<string[]>(immersiveFlipChars);
  const flipResetTimersRef = useRef<Record<number, number>>({});

  useEffect(() => {
    const previous = previousCharsRef.current;
    const changedIndexes: number[] = [];

    setFlipState((current) => {
      let changed = false;
      const nextState = { ...current };

      immersiveFlipChars.forEach((char, index) => {
        if (char === ":") {
          return;
        }
        if (previous[index] !== char) {
          changedIndexes.push(index);
          nextState[index] = {
            tick: (nextState[index]?.tick ?? 0) + 1,
            previousChar: previous[index] ?? char,
            isFlipping: true
          };
          changed = true;
        }
      });

      return changed ? nextState : current;
    });

    previousCharsRef.current = immersiveFlipChars;

    if (changedIndexes.length > 0) {
      changedIndexes.forEach((index) => {
        const existingTimer = flipResetTimersRef.current[index];
        if (existingTimer) {
          window.clearTimeout(existingTimer);
        }

        flipResetTimersRef.current[index] = window.setTimeout(() => {
          setFlipState((current) => {
            const currentState = current[index];
            if (!currentState?.isFlipping) {
              return current;
            }
            return {
              ...current,
              [index]: {
                ...currentState,
                isFlipping: false
              }
            };
          });
          delete flipResetTimersRef.current[index];
        }, FLIP_RESET_MS);
      });
    }
  }, [immersiveFlipChars]);

  useEffect(() => {
    return () => {
      Object.values(flipResetTimersRef.current).forEach((timerId) => {
        window.clearTimeout(timerId);
      });
    };
  }, []);

  const spotifyFeedback =
    spotifyConnected && nowPlaying?.playing && nowPlaying.track
      ? `${nowPlaying.track.title} - ${nowPlaying.track.artist}`
      : spotifyConnected
        ? "Spotify connected"
        : spotifyStatusMessage === "Spotify not connected."
          ? "Spotify disconnected"
          : spotifyStatusMessage;

  if (isImmersiveCanvas) {
    return (
      <Card
        className={`focus-card mode-${mode} accent-${settings.focusAccent} immersive-card immersive-canvas-card ${settings.animationsEnabled ? "with-animations" : "without-animations"}`}
        aria-label="Pomodoro immersive timer"
      >
        <CardContent className="immersive-canvas-content">
          <div className="timer-value immersive-canvas-timer immersive-flip-display" aria-live="polite">
            {immersiveFlipChars.map((char, index) =>
              char === ":" ? (
                <span key={`separator-${index}`} className="immersive-flip-separator" aria-hidden="true">
                  :
                </span>
              ) : (
                (() => {
                  const flipMeta = flipState[index];
                  const isFlipping = Boolean(flipMeta?.isFlipping && flipMeta.previousChar !== char);
                  const flipStyle = {
                    "--flip-delay": `${Math.max(0, immersiveFlipChars.length - index - 1) * 16}ms`
                  } as CSSProperties;
                  return (
                    <span
                      key={`digit-${index}`}
                      className={`immersive-flip-digit ${isFlipping ? "is-flipping" : ""}`}
                      style={flipStyle}
                      aria-hidden="true"
                    >
                      <span className="immersive-flip-panel immersive-flip-panel-top">
                        <span className="immersive-flip-panel-glyph">{char}</span>
                      </span>
                      <span className="immersive-flip-panel immersive-flip-panel-bottom">
                        <span className="immersive-flip-panel-glyph">{char}</span>
                      </span>
                      {isFlipping ? (
                        <>
                          <span key={`flap-top-${index}-${flipMeta?.tick ?? 0}`} className="immersive-flip-flap immersive-flip-flap-top">
                            <span className="immersive-flip-flap-glyph">{flipMeta?.previousChar}</span>
                          </span>
                          <span key={`flap-bottom-${index}-${flipMeta?.tick ?? 0}`} className="immersive-flip-flap immersive-flip-flap-bottom">
                            <span className="immersive-flip-flap-glyph">{char}</span>
                          </span>
                        </>
                      ) : null}
                    </span>
                  );
                })()
              )
            )}
          </div>
          <Button type="button" variant="outline" onClick={onExitImmersive}>
            Exit immersive
          </Button>
        </CardContent>
        {spotifyEnabled ? (
          <div className="immersive-canvas-spotify-hud" aria-live="polite">
            <span className={`immersive-canvas-spotify-dot ${spotifyConnected ? "is-connected" : "is-offline"}`} aria-hidden="true" />
            <p className="immersive-canvas-spotify-text">{spotifyFeedback}</p>
          </div>
        ) : null}
      </Card>
    );
  }

  return (
    <Card
      className={`focus-card mode-${mode} accent-${settings.focusAccent} ${settings.animationsEnabled ? "with-animations" : "without-animations"} ${status === "running" ? "is-running" : ""} ${isImmersiveActive ? "immersive-card" : ""}`}
      aria-label="Pomodoro focus timer"
    >
      <CardHeader className="focus-header">
        <p className="focus-kicker">{getModeLabel(mode)}</p>
        <CardTitle>Focus Timer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="timer-label">
          {mode === "focus"
            ? `Focus time (${settings.focusMinutes} min)`
            : mode === "short_break"
              ? `Break time (${settings.shortBreakMinutes} min)`
              : `Long break (${settings.longBreakMinutes} min)`}
        </p>
        <p className="timer-value" aria-live="polite">
          {timeLabel}
        </p>

        {!isImmersiveActive ? (
          <p className="cycle-stats">Focus sessions completed: {completedFocusSessions}</p>
        ) : null}

        {!isImmersiveActive ? (
          <Tabs value={mode} onValueChange={(value) => onModeSelect(value as SessionMode)} className="mode-switch">
            <TabsList className="w-full">
              <TabsTrigger value="focus" className="flex-1">Focus</TabsTrigger>
              <TabsTrigger value="short_break" className="flex-1">Break</TabsTrigger>
              <TabsTrigger value="long_break" className="flex-1">Long Break</TabsTrigger>
            </TabsList>
          </Tabs>
        ) : null}

        <div className="control-row">
          <Button variant="default" onClick={onStart} disabled={status === "running" || ritualActive}>
            {ritualActive ? "Preparing..." : startLabel}
          </Button>
          <Button variant="outline" onClick={onPause} disabled={!canPause || ritualActive}>
            Pause
          </Button>
          <Button variant="outline" onClick={onReset} disabled={!canReset}>
            Reset
          </Button>
        </div>

        {ritualActive ? (
          <section className="ritual-panel" aria-live="polite">
            <p className="ritual-title">Focus ritual</p>
            <p className="ritual-step">Check posture, silence distractions, breathe in.</p>
            <p className="ritual-countdown">{ritualRemaining}</p>
          </section>
        ) : null}

        {!isImmersiveActive ? (
          <label className="auto-cycle-toggle">
            <Switch checked={autoCycle} onCheckedChange={onAutoCycleChange} />
            Auto cycle (focus/break)
          </label>
        ) : null}

        <p className="hint">{hintMessage}</p>
        {isImmersiveActive && spotifyEnabled ? (
          <section className="immersive-spotify-hud" aria-live="polite">
            <span className={`immersive-spotify-dot ${spotifyConnected ? "is-connected" : "is-offline"}`} aria-hidden="true" />
            <p className="immersive-spotify-text">{spotifyFeedback}</p>
          </section>
        ) : null}
        {canEnterImmersive ? (
          <div className="immersive-actions">
            <Button type="button" variant="outline" onClick={onEnterImmersive}>
              Enter immersive
            </Button>
          </div>
        ) : null}
        {isImmersiveActive ? (
          <div className="immersive-actions">
            <Button type="button" variant="outline" onClick={onExitImmersive}>
              Exit immersive
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
