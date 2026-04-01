export interface Question {
  id: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  explanation?: string;
  tags?: string[];
}

export interface QuestionFile {
  category: string;
  icon: string;
  color: string;
  questions: Question[];
}

/** SM-2 spaced repetition card state */
export interface CardState {
  questionId: string;
  /** Easiness factor (min 1.3) */
  ef: number;
  /** Repetition count */
  repetitions: number;
  /** Current interval in days */
  interval: number;
  /** Next review date as ISO string */
  nextReview: string;
  /** Last quality rating 0-5 */
  lastQuality: number;
  /** Times this question was answered */
  totalAttempts: number;
  /** Times answered correctly */
  correctAttempts: number;
}

export interface QuizSession {
  id: string;
  date: string;
  category: string;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  totalQuestions: number;
  correctAnswers: number;
  timeSpentMs: number;
  questions: SessionQuestion[];
}

export interface SessionQuestion {
  questionId: string;
  correct: boolean;
  timeSpentMs: number;
  selectedAnswer: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null;
  /** Dates played as ISO date strings (YYYY-MM-DD) */
  playedDates: string[];
}

export interface UserSettings {
  dailyGoal: number;
  notificationsEnabled: boolean;
  notificationTime: string; // HH:mm
  preferredDifficulty: "easy" | "medium" | "hard" | "mixed";
  questionsPerSession: number;
  soundEnabled: boolean;
  theme: "dark" | "light" | "system";
  autoProgress: boolean;
  autoProgressDelayMs: number; // milliseconds before auto-advancing
}

export interface CategoryStats {
  category: string;
  totalAnswered: number;
  correctAnswers: number;
  averageTimeMs: number;
  lastPlayed: string | null;
  masteredCount: number;
  learningCount: number;
  newCount: number;
}

export type QuizMode = "practice" | "review" | "timed" | "category";
