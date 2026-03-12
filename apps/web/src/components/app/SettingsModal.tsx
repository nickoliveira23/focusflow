import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { FocusAccent, TimerSettings } from "@/app/types";

interface SettingsModalProps {
  isOpen: boolean;
  settings: TimerSettings;
  onClose: () => void;
  onSettingsChange: (next: TimerSettings) => void;
  onSave: () => void;
  onResetDefaults: () => void;
  feedbackMessage?: string | null;
}

export function SettingsModal({
  isOpen,
  settings,
  onClose,
  onSettingsChange,
  onSave,
  onResetDefaults,
  feedbackMessage
}: SettingsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="modal-card">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Configure focus, break, animation and immersive mode preferences.
        </DialogDescription>
        <div className="modal-header">
          <h2>Settings</h2>
        </div>
        <div className="settings-grid">
          <label>
            Focus (min)
            <Input
              type="number"
              min={1}
              max={120}
              value={settings.focusMinutes}
              onChange={(event) =>
                onSettingsChange({
                  ...settings,
                  focusMinutes: Number(event.target.value)
                })
              }
            />
          </label>
          <label>
            Short break (min)
            <Input
              type="number"
              min={1}
              max={60}
              value={settings.shortBreakMinutes}
              onChange={(event) =>
                onSettingsChange({
                  ...settings,
                  shortBreakMinutes: Number(event.target.value)
                })
              }
            />
          </label>
          <label>
            Long break (min)
            <Input
              type="number"
              min={1}
              max={60}
              value={settings.longBreakMinutes}
              onChange={(event) =>
                onSettingsChange({
                  ...settings,
                  longBreakMinutes: Number(event.target.value)
                })
              }
            />
          </label>
          <label>
            Long break every
            <Input
              type="number"
              min={1}
              max={12}
              value={settings.longBreakEvery}
              onChange={(event) =>
                onSettingsChange({
                  ...settings,
                  longBreakEvery: Number(event.target.value)
                })
              }
            />
          </label>
          <label>
            Focus accent
            <Select
              value={settings.focusAccent}
              onValueChange={(value) =>
                onSettingsChange({
                  ...settings,
                  focusAccent: value as FocusAccent
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select accent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amber">Amber</SelectItem>
                <SelectItem value="ocean">Ocean</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className="checkbox-label">
            <Switch
              checked={settings.ritualEnabled}
              onCheckedChange={(checked) =>
                onSettingsChange({
                  ...settings,
                  ritualEnabled: checked
                })
              }
            />
            Enable start ritual
          </label>
          <label className="checkbox-label">
            <Switch
              checked={settings.animationsEnabled}
              onCheckedChange={(checked) =>
                onSettingsChange({
                  ...settings,
                  animationsEnabled: checked
                })
              }
            />
            Enable transitions
          </label>
          <label className="checkbox-label">
            <Switch
              checked={settings.immersiveFocusEnabled}
              onCheckedChange={(checked) =>
                onSettingsChange({
                  ...settings,
                  immersiveFocusEnabled: checked
                })
              }
            />
            Immersive focus mode
          </label>
          <label className="checkbox-label">
            <Switch
              checked={settings.immersiveFocusFullscreen}
              onCheckedChange={(checked) =>
                onSettingsChange({
                  ...settings,
                  immersiveFocusFullscreen: checked
                })
              }
            />
            Try fullscreen on focus
          </label>
          <label className="checkbox-label">
            <Switch
              checked={settings.immersiveFocusOnlyTimer}
              onCheckedChange={(checked) =>
                onSettingsChange({
                  ...settings,
                  immersiveFocusOnlyTimer: checked
                })
              }
            />
            Full-canvas timer only
          </label>
          <label>
            Focus darkness ({settings.immersiveFocusDarkness}%)
            <input
              type="range"
              min={20}
              max={90}
              step={1}
              value={settings.immersiveFocusDarkness}
              className="darkness-slider"
              onChange={(event) =>
                onSettingsChange({
                  ...settings,
                  immersiveFocusDarkness: Number(event.target.value)
                })
              }
            />
          </label>
        </div>
        <div className="modal-footer">
          {feedbackMessage ? <p className="settings-feedback">{feedbackMessage}</p> : null}
          <Button type="button" variant="outline" onClick={onResetDefaults}>
            Default settings
          </Button>
          <Button type="button" variant="secondary" onClick={onSave}>
            Save settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
