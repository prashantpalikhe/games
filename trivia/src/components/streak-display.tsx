"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { getStreak } from "@/lib/db";
import type { StreakData } from "@/lib/types";
import { cn } from "@/lib/utils";

export function StreakDisplay({ className }: { className?: string }) {
  const [streak, setStreak] = useState<StreakData | null>(null);

  useEffect(() => {
    getStreak().then(setStreak);
  }, []);

  if (!streak) return null;

  const hasPlayedToday =
    streak.lastPlayedDate === new Date().toISOString().split("T")[0];

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3",
        className
      )}
    >
      <Flame
        className={cn(
          "h-8 w-8",
          hasPlayedToday ? "text-orange-500" : "text-muted-foreground"
        )}
        fill={hasPlayedToday ? "currentColor" : "none"}
      />
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold font-mono tabular-nums">
            {streak.currentStreak}
          </span>
          <span className="text-sm text-muted-foreground">day streak</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Best: {streak.longestStreak} days
        </p>
      </div>
    </div>
  );
}
