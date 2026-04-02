import type { Question, CategoryStats } from "./types";
import { getAllCardStates } from "./db";
import { getMasteryLevel } from "./spaced-repetition";
import { categories, getAllCategories } from "./category-registry";

// Re-export for consumers that only need metadata
export { getAllCategories } from "./category-registry";

// Re-export async loaders for consumers that need question data
export {
  loadCategoryQuestions,
  getAllQuestions,
  getQuestionById,
} from "./question-loader";

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

/**
 * Build category stats from card states.
 * Uses ID-prefix generation to avoid loading question data —
 * only the category registry (in the main bundle) is needed.
 */
export async function getCategoryStats(): Promise<CategoryStats[]> {
  const cards = await getAllCardStates();
  const cardMap = new Map(cards.map((c) => [c.questionId, c]));

  return getAllCategories().map(({ name }) => {
    const meta = categories.find((c) => c.name === name)!;
    let totalAnswered = 0;
    let correctAnswers = 0;
    let totalTimeMs = 0;
    let masteredCount = 0;
    let learningCount = 0;
    let newCount = 0;

    // Generate question IDs from the known prefix pattern
    for (let i = 1; i <= meta.questionCount; i++) {
      const id = `${meta.idPrefix}-${String(i).padStart(3, "0")}`;
      const card = cardMap.get(id);
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
