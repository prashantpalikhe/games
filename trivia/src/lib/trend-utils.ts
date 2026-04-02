import type { QuizSession } from "./types";

export interface AccuracyPoint {
  date: string;
  label: string;
  accuracy: number;
}

export interface SpeedPoint {
  date: string;
  label: string;
  avgSeconds: number;
}

export interface ActivityPoint {
  date: string;
  label: string;
  sessions: number;
  questions: number;
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Accuracy (%) per session over time.
 * Returns the last `limit` sessions sorted chronologically.
 */
export function getAccuracyOverTime(
  sessions: QuizSession[],
  limit = 30
): AccuracyPoint[] {
  return [...sessions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-limit)
    .map((s) => ({
      date: s.date,
      label: formatDateLabel(s.date),
      accuracy: Math.round((s.correctAnswers / s.totalQuestions) * 100),
    }));
}

/**
 * Average seconds per question per session over time.
 */
export function getSpeedOverTime(
  sessions: QuizSession[],
  limit = 30
): SpeedPoint[] {
  return [...sessions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-limit)
    .map((s) => ({
      date: s.date,
      label: formatDateLabel(s.date),
      avgSeconds: +(
        (s.answerTimeMs ?? s.questions.reduce((sum, q) => sum + q.timeSpentMs, 0)) /
        s.totalQuestions /
        1000
      ).toFixed(1),
    }));
}

/**
 * Sessions and questions answered per day.
 */
export function getActivityByDay(
  sessions: QuizSession[],
  limit = 30
): ActivityPoint[] {
  const byDay = new Map<
    string,
    { sessions: number; questions: number }
  >();

  for (const s of sessions) {
    const day = s.date.split("T")[0];
    const entry = byDay.get(day) ?? { sessions: 0, questions: 0 };
    entry.sessions += 1;
    entry.questions += s.totalQuestions;
    byDay.set(day, entry);
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-limit)
    .map(([date, data]) => ({
      date,
      label: formatDateLabel(date),
      sessions: data.sessions,
      questions: data.questions,
    }));
}
