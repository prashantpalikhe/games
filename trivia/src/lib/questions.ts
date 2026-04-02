import type { Question, QuestionFile, CategoryStats } from "./types";
import { getAllCardStates } from "./db";
import { getMasteryLevel } from "./spaced-repetition";

// Import all question files statically so they're bundled
import scienceData from "@/data/science.json";
import historyData from "@/data/history.json";
import geographyData from "@/data/geography.json";
import entertainmentData from "@/data/entertainment.json";
import technologyData from "@/data/technology.json";
import sportsData from "@/data/sports.json";
import frenchData from "@/data/french.json";
import webdevData from "@/data/webdev.json";

const questionFiles: QuestionFile[] = [
  scienceData as QuestionFile,
  historyData as QuestionFile,
  geographyData as QuestionFile,
  entertainmentData as QuestionFile,
  technologyData as QuestionFile,
  sportsData as QuestionFile,
  frenchData as QuestionFile,
  webdevData as QuestionFile,
];

export function getAllCategories(): {
  name: string;
  icon: string;
  color: string;
  questionCount: number;
}[] {
  return questionFiles.map((f) => ({
    name: f.category,
    icon: f.icon,
    color: f.color,
    questionCount: f.questions.length,
  }));
}

export function getAllQuestions(): Question[] {
  return questionFiles.flatMap((f) => f.questions);
}

export function getQuestionsByCategory(category: string): Question[] {
  const file = questionFiles.find(
    (f) => f.category.toLowerCase() === category.toLowerCase()
  );
  return file?.questions ?? [];
}

export function getQuestionById(id: string): Question | undefined {
  return getAllQuestions().find((q) => q.id === id);
}

export function getQuestionsByDifficulty(
  difficulty: "easy" | "medium" | "hard"
): Question[] {
  return getAllQuestions().filter((q) => q.difficulty === difficulty);
}

/** Shuffle array using Fisher-Yates */
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Get shuffled answers for a question */
export function getShuffledAnswers(question: Question): string[] {
  return shuffle([question.correctAnswer, ...question.incorrectAnswers]);
}

/** Build category stats from card states and sessions */
export async function getCategoryStats(): Promise<CategoryStats[]> {
  const cards = await getAllCardStates();
  const cardMap = new Map(cards.map((c) => [c.questionId, c]));

  return getAllCategories().map(({ name }) => {
    const questions = getQuestionsByCategory(name);
    let totalAnswered = 0;
    let correctAnswers = 0;
    let totalTimeMs = 0;
    let masteredCount = 0;
    let learningCount = 0;
    let newCount = 0;

    for (const q of questions) {
      const card = cardMap.get(q.id);
      if (!card) {
        newCount++;
        continue;
      }
      totalAnswered += card.totalAttempts;
      correctAnswers += card.correctAttempts;
      const level = getMasteryLevel(card);
      if (level === "mastered") masteredCount++;
      else if (level === "new") newCount++;
      else learningCount++;
    }

    return {
      category: name,
      totalAnswered,
      correctAnswers,
      averageTimeMs: totalAnswered > 0 ? totalTimeMs / totalAnswered : 0,
      lastPlayed: null,
      masteredCount,
      learningCount,
      newCount,
    };
  });
}
