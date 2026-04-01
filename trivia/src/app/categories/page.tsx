"use client";

import { useEffect, useState } from "react";
import { CategoryCard } from "@/components/category-card";
import { getAllCategories, getCategoryStats } from "@/lib/questions";
import type { CategoryStats } from "@/lib/types";

export default function CategoriesPage() {
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const categories = getAllCategories();

  useEffect(() => {
    getCategoryStats().then(setCategoryStats);
  }, []);

  const totalQuestions = categories.reduce(
    (sum, c) => sum + c.questionCount,
    0
  );
  const totalMastered = categoryStats.reduce(
    (sum, c) => sum + c.masteredCount,
    0
  );

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 pt-6">
      <div>
        <h1 className="text-2xl font-bold">Categories</h1>
        <p className="text-sm text-muted-foreground">
          {totalMastered} of {totalQuestions} questions mastered
        </p>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.name}
            {...cat}
            stats={categoryStats.find((s) => s.category === cat.name)}
          />
        ))}
      </div>
    </div>
  );
}
