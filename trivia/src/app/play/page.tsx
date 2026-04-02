"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Shuffle, Brain, Zap, Timer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuizEngine } from "@/components/quiz-engine";
import { shuffle, getAllCategories } from "@/lib/questions";
import {
  loadCategoryQuestions,
  getAllQuestions,
  getQuestionById,
} from "@/lib/question-loader";
import { getDueCards, getSettings } from "@/lib/db";
import type { Question } from "@/lib/types";

function PlayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [mode, setMode] = useState<string>("practice");
  const [category, setCategory] = useState<string>("All");
  const [showSetup, setShowSetup] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = getAllCategories();

  useEffect(() => {
    const urlMode = searchParams.get("mode");
    const urlCategory = searchParams.get("category");

    if (urlMode) setMode(urlMode);
    if (urlCategory) {
      setSelectedCategory(urlCategory);
      setCategory(urlCategory);
    }

    // Auto-start review mode
    if (urlMode === "review") {
      startReviewMode();
    }
    // Auto-start if category is provided
    if (urlCategory && !urlMode) {
      startCategoryMode(urlCategory);
    }
  }, [searchParams]);

  async function startReviewMode() {
    setLoading(true);
    const due = await getDueCards();
    if (due.length === 0) {
      setQuestions([]);
      setShowSetup(true);
      setLoading(false);
      return;
    }
    const reviewQuestions = (
      await Promise.all(due.map((c) => getQuestionById(c.questionId)))
    ).filter(Boolean) as Question[];
    setQuestions(shuffle(reviewQuestions).slice(0, 10));
    setMode("review");
    setShowSetup(false);
    setLoading(false);
  }

  async function startCategoryMode(cat: string) {
    setLoading(true);
    const settings = await getSettings();
    const catQuestions = await loadCategoryQuestions(cat);
    const difficulty = settings.preferredDifficulty;
    let filtered = catQuestions;
    if (difficulty !== "mixed") {
      filtered = catQuestions.filter((q) => q.difficulty === difficulty);
      if (filtered.length < 4) filtered = catQuestions;
    }
    setQuestions(shuffle(filtered).slice(0, settings.questionsPerSession));
    setCategory(cat);
    setShowSetup(false);
    setLoading(false);
  }

  async function startQuickPlay() {
    setLoading(true);
    const settings = await getSettings();
    let pool = selectedCategory
      ? await loadCategoryQuestions(selectedCategory)
      : await getAllQuestions();
    if (settings.preferredDifficulty !== "mixed") {
      const filtered = pool.filter(
        (q) => q.difficulty === settings.preferredDifficulty
      );
      if (filtered.length >= 4) pool = filtered;
    }
    setQuestions(shuffle(pool).slice(0, settings.questionsPerSession));
    setCategory(selectedCategory ?? "All");
    setShowSetup(false);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center pt-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!showSetup && questions && questions.length > 0) {
    return (
      <div className="mx-auto max-w-lg pt-4">
        <div className="mb-4 flex items-center gap-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSetup(true)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-semibold">
              {mode === "review" ? "Review Session" : category}
            </h2>
            <p className="text-xs text-muted-foreground">
              {questions.length} questions
            </p>
          </div>
        </div>
        <QuizEngine
          questions={questions}
          category={category}
          difficulty="mixed"
          onComplete={() => {
            setShowSetup(true);
            setQuestions(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 pt-6">
      <div>
        <h1 className="text-2xl font-bold">Play</h1>
        <p className="text-sm text-muted-foreground">
          Choose your challenge
        </p>
      </div>

      {/* Game Modes */}
      <div className="grid grid-cols-1 gap-3">
        <Card
          className="cursor-pointer transition-all hover:border-primary/50"
          onClick={startQuickPlay}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Shuffle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Quick Play</h3>
              <p className="text-xs text-muted-foreground">
                Random questions from{" "}
                {selectedCategory ? selectedCategory : "all categories"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:border-amber-500/50"
          onClick={startReviewMode}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
              <Brain className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold">Spaced Review</h3>
              <p className="text-xs text-muted-foreground">
                Review cards due for reinforcement
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Selection */}
      <div>
        <h3 className="mb-3 font-semibold">Select Category</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-xl border p-3 text-left transition-all ${
              !selectedCategory
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <span className="text-lg">🎲</span>
            <p className="mt-1 text-sm font-medium">All Categories</p>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`rounded-xl border p-3 text-left transition-all ${
                selectedCategory === cat.name
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <p className="mt-1 text-sm font-medium">{cat.name}</p>
              <p className="text-xs text-muted-foreground">
                {cat.questionCount} Qs
              </p>
            </button>
          ))}
        </div>
      </div>

      {questions !== null && questions.length === 0 && (
        <Card className="border-muted">
          <CardContent className="p-6 text-center">
            <Brain className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 font-semibold">No cards due for review</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Play some questions first, then come back later to review them.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense>
      <PlayContent />
    </Suspense>
  );
}
