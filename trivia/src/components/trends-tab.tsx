"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Zap, Activity } from "lucide-react";
import type { QuizSession } from "@/lib/types";
import {
  getAccuracyOverTime,
  getSpeedOverTime,
  getActivityByDay,
} from "@/lib/trend-utils";

interface TrendsTabProps {
  sessions: QuizSession[];
}

function TrendIndicator({
  values,
  unit,
  invertBetter = false,
}: {
  values: number[];
  unit: string;
  invertBetter?: boolean;
}) {
  if (values.length < 2) return null;

  const recent = values.slice(-5);
  const older = values.slice(-10, -5);
  if (older.length === 0) return null;

  const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length;
  const olderAvg = older.reduce((s, v) => s + v, 0) / older.length;

  const diff = recentAvg - olderAvg;
  const improving = invertBetter ? diff < 0 : diff > 0;
  const Icon = improving ? TrendingUp : TrendingDown;

  return (
    <span
      className={`flex items-center gap-1 text-xs font-medium ${
        improving ? "text-emerald-500" : "text-red-400"
      }`}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(diff).toFixed(1)}
      {unit}
    </span>
  );
}

// Chart colors — hardcoded because Recharts SVG doesn't support lab()/oklch() CSS vars
const CHART_COLORS = {
  accuracy: "#10b981", // emerald-500
  speed: "#3b82f6", // blue-500
  activity: "#f59e0b", // amber-500
  grid: "#27272a", // zinc-800
  axis: "#a1a1aa", // zinc-400
};

const tooltipStyle = {
  backgroundColor: "#18181b",
  border: "1px solid #27272a",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#fafafa",
};

export function TrendsTab({ sessions }: TrendsTabProps) {
  const accuracy = useMemo(() => getAccuracyOverTime(sessions), [sessions]);
  const speed = useMemo(() => getSpeedOverTime(sessions), [sessions]);
  const activity = useMemo(() => getActivityByDay(sessions), [sessions]);

  if (sessions.length < 2) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <Activity className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-3 font-semibold">Not enough data yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete at least 2 sessions to see your trends.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Accuracy over time */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-500" />
              <h3 className="text-sm font-semibold">Accuracy</h3>
            </div>
            <TrendIndicator values={accuracy.map((d) => d.accuracy)} unit="%" />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={accuracy}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_COLORS.grid}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
                axisLine={false}
                tickLine={false}
                width={32}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [`${value}%`, "Accuracy"]}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke={CHART_COLORS.accuracy}
                strokeWidth={2}
                dot={{ r: 3, fill: CHART_COLORS.accuracy }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Speed over time */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-semibold">Speed</h3>
            </div>
            <TrendIndicator
              values={speed.map((d) => d.avgSeconds)}
              unit="s"
              invertBetter
            />
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={speed}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_COLORS.grid}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
                axisLine={false}
                tickLine={false}
                width={32}
                tickFormatter={(v) => `${v}s`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [`${value}s`, "Avg per question"]}
              />
              <Line
                type="monotone"
                dataKey="avgSeconds"
                stroke={CHART_COLORS.speed}
                strokeWidth={2}
                dot={{ r: 3, fill: CHART_COLORS.speed }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Activity volume */}
      <Card>
        <CardContent className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold">Activity</h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={activity}>
              <defs>
                <linearGradient id="actGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={CHART_COLORS.activity}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor={CHART_COLORS.activity}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_COLORS.grid}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: CHART_COLORS.axis }}
                axisLine={false}
                tickLine={false}
                width={32}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, name) => [
                  value,
                  name === "questions" ? "Questions" : "Sessions",
                ]}
              />
              <Area
                type="monotone"
                dataKey="questions"
                stroke={CHART_COLORS.activity}
                strokeWidth={2}
                fill="url(#actGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
