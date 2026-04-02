import type { CategoryMeta } from "./types";

/**
 * Static category metadata — stays in the main bundle.
 * No question data is imported here.
 */
export const categories: CategoryMeta[] = [
  { name: "Science", icon: "🔬", color: "#22d3ee", questionCount: 50, idPrefix: "sci", dataModule: "science" },
  { name: "History", icon: "📜", color: "#f59e0b", questionCount: 50, idPrefix: "his", dataModule: "history" },
  { name: "Geography", icon: "🌍", color: "#10b981", questionCount: 50, idPrefix: "geo", dataModule: "geography" },
  { name: "Entertainment", icon: "🎬", color: "#a855f7", questionCount: 50, idPrefix: "ent", dataModule: "entertainment" },
  { name: "Technology", icon: "💻", color: "#3b82f6", questionCount: 50, idPrefix: "tech", dataModule: "technology" },
  { name: "Sports", icon: "⚽", color: "#ef4444", questionCount: 50, idPrefix: "spo", dataModule: "sports" },
  { name: "French", icon: "🇫🇷", color: "#3b82f6", questionCount: 50, idPrefix: "fr", dataModule: "french" },
  { name: "Web Development", icon: "💻", color: "#a855f7", questionCount: 50, idPrefix: "web", dataModule: "webdev" },
];

/** Map from ID prefix to category metadata for fast lookup */
const prefixMap = new Map(categories.map((c) => [c.idPrefix, c]));

export function getAllCategories() {
  return categories.map(({ name, icon, color, questionCount }) => ({
    name,
    icon,
    color,
    questionCount,
  }));
}

export function getCategoryByPrefix(prefix: string): CategoryMeta | undefined {
  return prefixMap.get(prefix);
}
