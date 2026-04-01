"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Brain,
  Play,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StreakDisplay } from "@/components/streak-display";
import { HeatmapCalendar } from "@/components/heatmap-calendar";
import { CategoryCard } from "@/components/category-card";
import {
  getStreak,
  getRecentSessions,
  getDueCards,
  getSettings,
} from "@/lib/db";
import { getAllCategories, getCategoryStats } from "@/lib/questions";
import type { StreakData, QuizSession, CategoryStats, UserSettings } from "@/lib/types";

export default function HomePage() {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [recentSessions, setRecentSessions] = useState<QuizSession[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    Promise.all([
      getStreak(),
      getRecentSessions(5),
      getDueCards(),
      getCategoryStats(),
      getSettings(),
    ]).then(([s, rs, dc, cs, st]) => {
      setStreak(s);
      setRecentSessions(rs);
      setDueCount(dc.length);
      setCategoryStats(cs);
      setSettings(st);
    });
  }, []);

  const categories = getAllCategories();
  const todayAnswered = recentSessions
    .filter(
      (s) => s.date.split("T")[0] === new Date().toISOString().split("T")[0]
    )
    .reduce((sum, s) => sum + s.totalQuestions, 0);
  const dailyGoal = settings?.dailyGoal ?? 10;
  const dailyProgress = Math.min(100, (todayAnswered / dailyGoal) * 100);

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 pt-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Trivia Master</h1>
        <p className="text-sm text-muted-foreground">
          Train your brain, one question at a time
        </p>
      </div>

      {/* Streak + Daily Goal */}
      <div className="grid grid-cols-2 gap-3">
        <StreakDisplay />
        <Card>
          <CardContent className="flex flex-col justify-center p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Daily Goal</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono tabular-nums">
                {todayAnswered}
              </span>
              <span className="text-sm text-muted-foreground">
                / {dailyGoal}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${dailyProgress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {dueCount > 0 && (
          <Link href="/play?mode=review" className="col-span-2">
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                  <RotateCcw className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Review Due Cards</h3>
                  <p className="text-xs text-muted-foreground">
                    {dueCount} cards ready for review
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-amber-500/10 text-amber-500"
                >
                  {dueCount}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        )}

        <Link href="/play">
          <Button className="h-auto w-full flex-col gap-1 py-4">
            <Play className="h-6 w-6" />
            <span className="text-sm">Quick Play</span>
          </Button>
        </Link>

        <Link href="/play?mode=review">
          <Button
            variant="outline"
            className="h-auto w-full flex-col gap-1 py-4"
          >
            <Brain className="h-6 w-6" />
            <span className="text-sm">Review</span>
          </Button>
        </Link>
      </div>

      {/* Activity Heatmap */}
      {streak && streak.playedDates.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 text-sm font-semibold">Activity</h3>
            <HeatmapCalendar playedDates={streak.playedDates} />
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Categories</h3>
          <Link
            href="/categories"
            className="text-xs text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {categories.slice(0, 3).map((cat) => (
            <CategoryCard
              key={cat.name}
              {...cat}
              stats={categoryStats.find((s) => s.category === cat.name)}
            />
          ))}
        </div>
      </div>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div>
          <h3 className="mb-3 font-semibold">Recent Sessions</h3>
          <div className="space-y-3">
            {recentSessions.slice(0, 3).map((session) => (
              <Card key={session.id}>
                <CardContent className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium">{session.category}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold">
                      {session.correctAnswers}/{session.totalQuestions}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(
                        (session.correctAnswers / session.totalQuestions) * 100
                      )}
                      %
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
