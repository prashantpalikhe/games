import { openDB, type IDBPDatabase } from "idb";
import type {
  CardState,
  QuizSession,
  StreakData,
  UserSettings,
} from "./types";

const DB_NAME = "trivia-master";
const DB_VERSION = 1;

export interface TriviaDB {
  cardStates: {
    key: string;
    value: CardState;
    indexes: { "by-next-review": string; "by-question": string };
  };
  sessions: {
    key: string;
    value: QuizSession;
    indexes: { "by-date": string; "by-category": string };
  };
  streak: {
    key: string;
    value: StreakData;
  };
  settings: {
    key: string;
    value: UserSettings;
  };
}

let dbPromise: Promise<IDBPDatabase<TriviaDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<TriviaDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Card states for spaced repetition
        const cardStore = db.createObjectStore("cardStates", {
          keyPath: "questionId",
        });
        cardStore.createIndex("by-next-review", "nextReview");
        cardStore.createIndex("by-question", "questionId");

        // Quiz sessions
        const sessionStore = db.createObjectStore("sessions", {
          keyPath: "id",
        });
        sessionStore.createIndex("by-date", "date");
        sessionStore.createIndex("by-category", "category");

        // Streak data (single record)
        db.createObjectStore("streak", { keyPath: "currentStreak" });

        // User settings (single record)
        db.createObjectStore("settings");
      },
    });
  }
  return dbPromise;
}

// --- Card State Operations ---

export async function getCardState(
  questionId: string
): Promise<CardState | undefined> {
  const db = await getDB();
  return db.get("cardStates", questionId);
}

export async function getAllCardStates(): Promise<CardState[]> {
  const db = await getDB();
  return db.getAll("cardStates");
}

export async function putCardState(state: CardState): Promise<void> {
  const db = await getDB();
  await db.put("cardStates", state);
}

export async function getDueCards(now?: Date): Promise<CardState[]> {
  const db = await getDB();
  const all = await db.getAll("cardStates");
  const cutoff = (now ?? new Date()).toISOString();
  return all.filter((c) => c.nextReview <= cutoff);
}

// --- Session Operations ---

export async function saveSession(session: QuizSession): Promise<void> {
  const db = await getDB();
  await db.put("sessions", session);
}

export async function getAllSessions(): Promise<QuizSession[]> {
  const db = await getDB();
  return db.getAll("sessions");
}

export async function getSessionsByCategory(
  category: string
): Promise<QuizSession[]> {
  const db = await getDB();
  return db.getAllFromIndex("sessions", "by-category", category);
}

export async function getRecentSessions(limit: number): Promise<QuizSession[]> {
  const db = await getDB();
  const all = await db.getAll("sessions");
  return all
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

// --- Streak Operations ---

const STREAK_KEY = 1;

export async function getStreak(): Promise<StreakData> {
  const db = await getDB();
  const data = await db.get("streak", STREAK_KEY as never);
  return (
    data ?? {
      currentStreak: 0,
      longestStreak: 0,
      lastPlayedDate: null,
      playedDates: [],
    }
  );
}

export async function updateStreak(): Promise<StreakData> {
  const db = await getDB();
  const streak = await getStreak();
  const today = new Date().toISOString().split("T")[0];

  if (streak.lastPlayedDate === today) {
    return streak; // Already played today
  }

  const yesterday = new Date(Date.now() - 86400000)
    .toISOString()
    .split("T")[0];

  if (streak.lastPlayedDate === yesterday) {
    streak.currentStreak += 1;
  } else if (streak.lastPlayedDate !== today) {
    streak.currentStreak = 1;
  }

  streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
  streak.lastPlayedDate = today;

  if (!streak.playedDates.includes(today)) {
    streak.playedDates.push(today);
    // Keep last 365 days
    if (streak.playedDates.length > 365) {
      streak.playedDates = streak.playedDates.slice(-365);
    }
  }

  await db.put("streak", streak, STREAK_KEY as never);
  return streak;
}

// --- Settings Operations ---

const SETTINGS_KEY = "user-settings";

const DEFAULT_SETTINGS: UserSettings = {
  dailyGoal: 10,
  notificationsEnabled: false,
  notificationTime: "09:00",
  preferredDifficulty: "mixed",
  questionsPerSession: 10,
  soundEnabled: true,
  hapticsEnabled: true,
  theme: "dark",
  autoProgress: false,
  autoProgressDelayMs: 2000,
};

export async function getSettings(): Promise<UserSettings> {
  const db = await getDB();
  const data = await db.get("settings", SETTINGS_KEY);
  return data ?? DEFAULT_SETTINGS;
}

export async function saveSettings(
  settings: Partial<UserSettings>
): Promise<UserSettings> {
  const db = await getDB();
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await db.put("settings", updated, SETTINGS_KEY);
  return updated;
}
