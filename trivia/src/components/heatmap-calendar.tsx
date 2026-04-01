"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeatmapCalendarProps {
  playedDates: string[];
  className?: string;
}

export function HeatmapCalendar({ playedDates, className }: HeatmapCalendarProps) {
  const weeks = useMemo(() => {
    const played = new Set(playedDates);
    const today = new Date();
    const result: { date: string; played: boolean; day: number }[][] = [];
    let currentWeek: { date: string; played: boolean; day: number }[] = [];

    // Go back 12 weeks
    const start = new Date(today);
    start.setDate(start.getDate() - 83); // ~12 weeks
    start.setDate(start.getDate() - start.getDay()); // align to Sunday

    for (
      let d = new Date(start);
      d <= today;
      d.setDate(d.getDate() + 1)
    ) {
      const iso = d.toISOString().split("T")[0];
      currentWeek.push({
        date: iso,
        played: played.has(iso),
        day: d.getDay(),
      });
      if (d.getDay() === 6) {
        result.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length) result.push(currentWeek);

    return result;
  }, [playedDates]);

  return (
    <div className={cn("flex gap-1", className)}>
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {week.map(({ date, played }) => (
            <Tooltip key={date}>
              <TooltipTrigger
                className={cn(
                  "h-3 w-3 rounded-sm",
                  played
                    ? "bg-emerald-500"
                    : "bg-muted"
                )}
              />
              <TooltipContent side="top" className="text-xs">
                {date} {played ? "- Played" : ""}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      ))}
    </div>
  );
}
