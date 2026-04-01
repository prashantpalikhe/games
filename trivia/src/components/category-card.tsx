"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CategoryStats } from "@/lib/types";

interface CategoryCardProps {
  name: string;
  icon: string;
  color: string;
  questionCount: number;
  stats?: CategoryStats;
}

export function CategoryCard({
  name,
  icon,
  color,
  questionCount,
  stats,
}: CategoryCardProps) {
  const mastered = stats?.masteredCount ?? 0;
  const progress = questionCount > 0 ? (mastered / questionCount) * 100 : 0;
  const accuracy =
    stats && stats.totalAnswered > 0
      ? Math.round((stats.correctAnswers / stats.totalAnswered) * 100)
      : 0;

  return (
    <Link href={`/play?category=${encodeURIComponent(name)}`}>
      <Card className="group cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
            style={{ backgroundColor: `${color}20` }}
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold truncate">{name}</h3>
              {stats && stats.totalAnswered > 0 && (
                <span className="text-xs text-muted-foreground font-mono">
                  {accuracy}%
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {questionCount} questions
            </p>
            <Progress value={progress} className="mt-2 h-1.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
