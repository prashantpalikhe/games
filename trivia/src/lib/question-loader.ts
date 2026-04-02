import type { Question, QuestionFile } from "./types";
import { categories, getCategoryByPrefix } from "./category-registry";

/**
 * Lazy question loader — each category's JSON is loaded on demand
 * and cached for the duration of the session.
 */

const cache = new Map<string, Question[]>();

const loaders: Record<string, () => Promise<QuestionFile>> = {
  science: () => import("@/data/science.json").then((m) => m.default as QuestionFile),
  history: () => import("@/data/history.json").then((m) => m.default as QuestionFile),
  geography: () => import("@/data/geography.json").then((m) => m.default as QuestionFile),
  entertainment: () => import("@/data/entertainment.json").then((m) => m.default as QuestionFile),
  technology: () => import("@/data/technology.json").then((m) => m.default as QuestionFile),
  sports: () => import("@/data/sports.json").then((m) => m.default as QuestionFile),
  french: () => import("@/data/french.json").then((m) => m.default as QuestionFile),
  webdev: () => import("@/data/webdev.json").then((m) => m.default as QuestionFile),
};

/** Load questions for a single category (cached after first load) */
export async function loadCategoryQuestions(categoryName: string): Promise<Question[]> {
  const meta = categories.find(
    (c) => c.name.toLowerCase() === categoryName.toLowerCase()
  );
  if (!meta) return [];

  const cached = cache.get(meta.dataModule);
  if (cached) return cached;

  const loader = loaders[meta.dataModule];
  if (!loader) return [];

  const file = await loader();
  cache.set(meta.dataModule, file.questions);
  return file.questions;
}

/** Load questions for all categories */
export async function getAllQuestions(): Promise<Question[]> {
  const results = await Promise.all(
    categories.map((c) => loadCategoryQuestions(c.name))
  );
  return results.flat();
}

/** Preload all categories in the background (fire-and-forget) */
export function preloadAllQuestions(): void {
  getAllQuestions().catch(() => {
    // Silently ignore — preloading is best-effort
  });
}

/** Find a question by ID (loads only the relevant category) */
export async function getQuestionById(id: string): Promise<Question | undefined> {
  const prefix = id.split("-")[0];
  const meta = getCategoryByPrefix(prefix);

  if (meta) {
    const questions = await loadCategoryQuestions(meta.name);
    return questions.find((q) => q.id === id);
  }

  // Fallback: search all categories
  const all = await getAllQuestions();
  return all.find((q) => q.id === id);
}
