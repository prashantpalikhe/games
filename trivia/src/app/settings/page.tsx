"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sheet } from "@silk-hq/components";
import {
  Bell,
  FastForward,
  Moon,
  Sun,
  Monitor,
  Volume2,
  VolumeX,
  Target,
  Hash,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { getSettings, saveSettings, getDB } from "@/lib/db";
import { requestNotificationPermission, scheduleStreakReminder } from "@/lib/notifications";
import type { UserSettings } from "@/lib/types";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [resetSheetOpen, setResetSheetOpen] = useState(false);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  async function updateSetting(update: Partial<UserSettings>) {
    const updated = await saveSettings(update);
    setSettings(updated);
  }

  async function handleNotificationToggle(enabled: boolean) {
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) return;
      scheduleStreakReminder(settings?.notificationTime ?? "09:00");
    }
    await updateSetting({ notificationsEnabled: enabled });
  }

  async function handleResetData() {
    const db = await getDB();
    await db.clear("cardStates");
    await db.clear("sessions");
    await db.clear("streak");
    setResetSheetOpen(false);
    window.location.reload();
  }

  if (!settings) return null;

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 pt-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Customize your experience
        </p>
      </div>

      {/* Appearance */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <h3 className="font-semibold">Appearance</h3>
          <div className="flex gap-2">
            {[
              { value: "light", icon: Sun, label: "Light" },
              { value: "dark", icon: Moon, label: "Dark" },
              { value: "system", icon: Monitor, label: "System" },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => {
                  setTheme(value);
                  updateSetting({ theme: value as UserSettings["theme"] });
                }}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl border p-3 transition-all ${
                  theme === value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Preferences */}
      <Card>
        <CardContent className="space-y-5 p-4">
          <h3 className="font-semibold">Learning</h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                Daily Goal
              </Label>
              <Badge variant="secondary" className="font-mono">
                {settings.dailyGoal}
              </Badge>
            </div>
            <Slider
              value={[settings.dailyGoal]}
              onValueChange={(v) => updateSetting({ dailyGoal: Array.isArray(v) ? v[0] : v })}
              min={5}
              max={50}
              step={5}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                Questions per Session
              </Label>
              <Badge variant="secondary" className="font-mono">
                {settings.questionsPerSession}
              </Badge>
            </div>
            <Slider
              value={[settings.questionsPerSession]}
              onValueChange={(v) =>
                updateSetting({ questionsPerSession: Array.isArray(v) ? v[0] : v })
              }
              min={5}
              max={30}
              step={5}
            />
          </div>

          <Separator />

          <div>
            <Label className="mb-2 block">Preferred Difficulty</Label>
            <div className="flex gap-2">
              {(["easy", "medium", "hard", "mixed"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => updateSetting({ preferredDifficulty: d })}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-all ${
                    settings.preferredDifficulty === d
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <FastForward className="h-4 w-4 text-muted-foreground" />
              Auto-Progress
            </Label>
            <Switch
              checked={settings.autoProgress}
              onCheckedChange={(v) => updateSetting({ autoProgress: v })}
            />
          </div>

          {settings.autoProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">
                  Delay before next question
                </Label>
                <Badge variant="secondary" className="font-mono">
                  {settings.autoProgressDelayMs / 1000}s
                </Badge>
              </div>
              <Slider
                value={[settings.autoProgressDelayMs]}
                onValueChange={(v) =>
                  updateSetting({
                    autoProgressDelayMs: Array.isArray(v) ? v[0] : v,
                  })
                }
                min={1000}
                max={5000}
                step={500}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <h3 className="font-semibold">Notifications</h3>

          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              Streak Reminders
            </Label>
            <Switch
              checked={settings.notificationsEnabled}
              onCheckedChange={handleNotificationToggle}
            />
          </div>

          {settings.notificationsEnabled && (
            <div className="flex items-center justify-between">
              <Label>Reminder Time</Label>
              <input
                type="time"
                value={settings.notificationTime}
                onChange={(e) => {
                  updateSetting({ notificationTime: e.target.value });
                  scheduleStreakReminder(e.target.value);
                }}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sound */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              {settings.soundEnabled ? (
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
              Sound Effects
            </Label>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={(v) => updateSetting({ soundEnabled: v })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardContent className="p-4">
          <h3 className="font-semibold text-destructive">Danger Zone</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            This will permanently delete all your progress data.
          </p>
          <Button
            variant="destructive"
            className="mt-3 gap-2"
            onClick={() => setResetSheetOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Reset All Data
          </Button>
        </CardContent>
      </Card>

      {/* Reset Confirmation Sheet */}
      <Sheet.Root
        presented={resetSheetOpen}
        onPresentedChange={setResetSheetOpen}
        license="non-commercial"
      >
        <Sheet.Portal>
          <Sheet.View>
            <Sheet.Backdrop className="bg-black/60" />
            <Sheet.Content className="rounded-t-2xl bg-card p-6 pb-10">
              <Sheet.Handle className="bg-muted-foreground/30" />
              <div className="mt-4 text-center">
                <Trash2 className="mx-auto h-10 w-10 text-destructive" />
                <h3 className="mt-3 text-lg font-bold">Reset All Data?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  This will delete all your progress, streaks, and session
                  history. This action cannot be undone.
                </p>
                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setResetSheetOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleResetData}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </Sheet.Content>
          </Sheet.View>
        </Sheet.Portal>
      </Sheet.Root>
    </div>
  );
}
