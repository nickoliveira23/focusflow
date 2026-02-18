import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SessionMode, TimerSettings, TimerStatus } from "@/app/types";
import { getModeLabel } from "@/app/utils";

interface TimerCardProps {
  mode: SessionMode;
  settings: TimerSettings;
  status: TimerStatus;
  timeLabel: string;
  completedFocusSessions: number;
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

export function TimerCard({
  mode,
  settings,
  status,
  timeLabel,
  completedFocusSessions,
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
  if (isImmersiveCanvas) {
    return (
      <Card
        className={`focus-card mode-${mode} accent-${settings.focusAccent} immersive-card immersive-canvas-card ${settings.animationsEnabled ? "with-animations" : "without-animations"}`}
        aria-label="Pomodoro immersive timer"
      >
        <CardContent className="immersive-canvas-content">
          <p className="timer-value immersive-canvas-timer" aria-live="polite">
            {timeLabel}
          </p>
          <Button type="button" variant="outline" onClick={onExitImmersive}>
            Exit immersive
          </Button>
        </CardContent>
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
