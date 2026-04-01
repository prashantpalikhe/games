"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Brain,
  CheckCircle,
  Clock,
  Flame,
  Target,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { StreakDisplay } from "@/components/streak-display";
import { HeatmapCalendar } from "@/components/heatmap-calendar";
import {
  getStreak,
  getAllSessions,
  getAllCardStates,
} from "@/lib/db";
import { getAllCategories, getCategoryStats } from "@/lib/questions";
import { getMasteryLevel } from "@/lib/spaced-repetition";
import type {
  StreakData,
  QuizSession,
  CardState,
  CategoryStats,
} from "@/lib/types";

export default function StatsPage() {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [sessions, setSessions] = useState<QuizSession[]>([]);
  const [cards, setCards] = useState<CardState[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);

  useEffect(() => {
    Promise.all([
      getStreak(),
      getAllSessions(),
      getAllCardStates(),
      getCategoryStats(),
    ]).then(([s, sess, c, cs]) => {
      setStreak(s);
      setSessions(sess);
      setCards(c);
      setCategoryStats(cs);
    });
  }, []);

  const categories = getAllCategories();

  const totalAnswered = sessions.reduce(
    (sum, s) => sum + s.totalQuestions,
    0
  );
  const totalCorrect = sessions.reduce(
    (sum, s) => sum + s.correctAnswers,
    0
  );
  const overallAccuracy =
    totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const totalTime = sessions.reduce((sum, s) => sum + s.timeSpentMs, 0);
  const avgTimePerQuestion =
    totalAnswered > 0 ? Math.round(totalTime / totalAnswered / 1000) : 0;

  const masteryBreakdown = {
    new: cards.filter((c) => getMasteryLevel(c) === "new").length,
    learning: cards.filter((c) => getMasteryLevel(c) === "learning").length,
    reviewing: cards.filter((c) => getMasteryLevel(c) === "reviewing").length,
    mastered: cards.filter((c) => getMasteryLevel(c) === "mastered").length,
  };

  const totalTracked = Object.values(masteryBreakdown).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 pt-6">
      <div>
        <h1 className="text-2xl font-bold">Statistics</h1>
        <p className="text-sm text-muted-foreground">
          Track your learning progress
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="flex-1">
            Overview
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex-1">
            Categories
          </TabsTrigger>
          <TabsTrigger value="mastery" className="flex-1">
            Mastery
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <StreakDisplay className="w-full" />

          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="flex flex-col items-center p-4">
                <Target className="h-5 w-5 text-primary" />
                <span className="mt-1 text-2xl font-bold font-mono">
                  {overallAccuracy}%
                </span>
                <span className="text-xs text-muted-foreground">Accuracy</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center p-4">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="mt-1 text-2xl font-bold font-mono">
                  {totalAnswered}
                </span>
                <span className="text-xs text-muted-foreground">
                  Answered
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center p-4">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <span className="mt-1 text-2xl font-bold font-mono">
                  {sessions.length}
                </span>
                <span className="text-xs text-muted-foreground">Sessions</span>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center p-4">
                <Clock className="h-5 w-5 text-amber-500" />
                <span className="mt-1 text-2xl font-bold font-mono">
                  {avgTimePerQuestion}s
                </span>
                <span className="text-xs text-muted-foreground">Avg Time</span>
              </CardContent>
            </Card>
          </div>

          {streak && streak.playedDates.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="mb-3 text-sm font-semibold">
                  Activity History
                </h3>
                <HeatmapCalendar playedDates={streak.playedDates} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categories" className="mt-4 space-y-3">
          {categories.map((cat) => {
            const stats = categoryStats.find(
              (s) => s.category === cat.name
            );
            const accuracy =
              stats && stats.totalAnswered > 0
                ? Math.round(
                    (stats.correctAnswers / stats.totalAnswered) * 100
                  )
                : 0;

            return (
              <Card key={cat.name}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{cat.name}</h3>
                        <Badge variant="secondary" className="font-mono">
                          {accuracy}%
                        </Badge>
                      </div>
                      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                        <span>
                          {stats?.totalAnswered ?? 0} answered
                        </span>
                        <span>
                          {stats?.masteredCount ?? 0} mastered
                        </span>
                        <span>
                          {stats?.learningCount ?? 0} learning
                        </span>
                      </div>
                      <Progress
                        value={
                          cat.questionCount > 0
                            ? ((stats?.masteredCount ?? 0) /
                                cat.questionCount) *
                              100
                            : 0
                        }
                        className="mt-2 h-1.5"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="mastery" className="mt-4 space-y-4">
          <Card>
            <CardContent className="space-y-4 p-4">
              <h3 className="font-semibold">Mastery Levels</h3>

              {totalTracked === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Play some questions to start tracking mastery.
                </p>
              ) : (
                <>
                  <div className="space-y-3">
                    {[
                      {
                        label: "Mastered",
                        count: masteryBreakdown.mastered,
                        color: "bg-emerald-500",
                      },
                      {
                        label: "Reviewing",
                        count: masteryBreakdown.reviewing,
                        color: "bg-blue-500",
                      },
                      {
                        label: "Learning",
                        count: masteryBreakdown.learning,
                        color: "bg-amber-500",
                      },
                      {
                        label: "New",
                        count: masteryBreakdown.new,
                        color: "bg-muted-foreground",
                      },
                    ].map(({ label, count, color }) => (
                      <div key={label} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{label}</span>
                          <span className="font-mono text-muted-foreground">
                            {count}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${color} transition-all`}
                            style={{
                              width: `${
                                totalTracked > 0
                                  ? (count / totalTracked) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <Brain className="mx-auto h-5 w-5 text-muted-foreground" />
                      <span className="mt-1 block text-lg font-bold font-mono">
                        {totalTracked}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Cards Tracked
                      </span>
                    </div>
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <TrendingUp className="mx-auto h-5 w-5 text-emerald-500" />
                      <span className="mt-1 block text-lg font-bold font-mono">
                        {totalTracked > 0
                          ? Math.round(
                              (masteryBreakdown.mastered / totalTracked) * 100
                            )
                          : 0}
                        %
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Mastered
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
