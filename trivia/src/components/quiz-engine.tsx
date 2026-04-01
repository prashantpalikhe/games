"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  CheckCircle,
  XCircle,
  ChevronRight,
  Trophy,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { Question, SessionQuestion } from "@/lib/types";
import { getShuffledAnswers } from "@/lib/questions";
import {
  getCardState,
  putCardState,
  saveSession,
  updateStreak,
  getSettings,
} from "@/lib/db";
import {
  createInitialCardState,
  processReview,
  calculateQuality,
} from "@/lib/spaced-repetition";
import { useHaptics } from "@/hooks/use-haptics";

interface QuizEngineProps {
  questions: Question[];
  category: string;
  difficulty: string;
  onComplete: () => void;
}

export function QuizEngine({
  questions,
  category,
  difficulty,
  onComplete,
}: QuizEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [sessionStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isComplete, setIsComplete] = useState(false);
  const [autoProgress, setAutoProgress] = useState(false);
  const [autoProgressDelay, setAutoProgressDelay] = useState(2000);
  const [autoProgressCountdown, setAutoProgressCountdown] = useState(0);
  const [completionStats, setCompletionStats] = useState<{
    correctCount: number;
    totalTime: number;
  } | null>(null);
  const haptics = useHaptics();
  const answeredRef = useRef(false);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Use a ref to track session questions to avoid stale closures
  const sessionQuestionsRef = useRef<SessionQuestion[]>([]);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // Load auto-progress setting
  useEffect(() => {
    getSettings().then((s) => {
      setAutoProgress(s.autoProgress);
      setAutoProgressDelay(s.autoProgressDelayMs);
    });
  }, []);

  useEffect(() => {
    if (currentQuestion) {
      setAnswers(getShuffledAnswers(currentQuestion));
      setQuestionStartTime(Date.now());
      answeredRef.current = false;
    }
  }, [currentQuestion]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  function clearTimers() {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    autoTimerRef.current = null;
    countdownRef.current = null;
    setAutoProgressCountdown(0);
  }

  async function finishSession() {
    const allQuestions = sessionQuestionsRef.current;
    const correctCount = allQuestions.filter((q) => q.correct).length;
    await saveSession({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      category,
      difficulty: difficulty as "easy" | "medium" | "hard" | "mixed",
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      timeSpentMs: Date.now() - sessionStartTime,
      questions: allQuestions,
    });
    await updateStreak();
    setCompletionStats({
      correctCount,
      totalTime: Math.round((Date.now() - sessionStartTime) / 1000),
    });
    setIsComplete(true);
  }

  function advanceToNext() {
    clearTimers();
    setShowResult(false);
    setSelectedAnswer(null);

    if (currentIndex + 1 >= questions.length) {
      finishSession();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  // Stable ref so timers never call a stale version
  const advanceRef = useRef(advanceToNext);
  advanceRef.current = advanceToNext;

  const handleAnswer = useCallback(
    async (answer: string) => {
      if (answeredRef.current) return;
      answeredRef.current = true;

      setSelectedAnswer(answer);
      setShowResult(true);

      const correct = answer === currentQuestion.correctAnswer;
      const timeSpent = Date.now() - questionStartTime;

      // Haptic feedback
      if (correct) haptics.success();
      else haptics.error();

      // Update spaced repetition
      let card = await getCardState(currentQuestion.id);
      if (!card) card = createInitialCardState(currentQuestion.id);
      const quality = calculateQuality(correct, timeSpent);
      const updated = processReview(card, quality, correct);
      await putCardState(updated);

      // Track in ref (no stale closure issues)
      sessionQuestionsRef.current = [
        ...sessionQuestionsRef.current,
        {
          questionId: currentQuestion.id,
          correct,
          timeSpentMs: timeSpent,
          selectedAnswer: answer,
        },
      ];

      // Auto-progress only on correct answers — wrong answers require manual tap
      if (autoProgress && correct) {
        setAutoProgressCountdown(autoProgressDelay);
        countdownRef.current = setInterval(() => {
          setAutoProgressCountdown((prev) => {
            if (prev <= 100) {
              if (countdownRef.current) clearInterval(countdownRef.current);
              return 0;
            }
            return prev - 100;
          });
        }, 100);
        autoTimerRef.current = setTimeout(() => {
          clearTimers();
          advanceRef.current();
        }, autoProgressDelay);
      }
    },
    [currentQuestion, questionStartTime, autoProgress, autoProgressDelay]
  );

  if (isComplete && completionStats) {
    const { correctCount, totalTime } = completionStats;
    const percentage = Math.round((correctCount / questions.length) * 100);

    return (
      <div className="flex flex-col items-center gap-6 px-4 py-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Trophy className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Session Complete!</h2>
          <p className="mt-1 text-muted-foreground">
            You answered {correctCount} of {questions.length} correctly
          </p>
        </div>

        <div className="grid w-full max-w-sm grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <span className="text-2xl font-bold font-mono text-emerald-500">
                {percentage}%
              </span>
              <span className="text-xs text-muted-foreground">Accuracy</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <span className="text-2xl font-bold font-mono">
                {correctCount}/{questions.length}
              </span>
              <span className="text-xs text-muted-foreground">Correct</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <span className="text-2xl font-bold font-mono">{totalTime}s</span>
              <span className="text-xs text-muted-foreground">Time</span>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onComplete} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Done
          </Button>
          <Button
            onClick={() => {
              setCurrentIndex(0);
              sessionQuestionsRef.current = [];
              setIsComplete(false);
              setCompletionStats(null);
              setSelectedAnswer(null);
              setShowResult(false);
            }}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Play Again
          </Button>
        </div>
      </div>
    );
  }

  const isCorrectAnswer = selectedAnswer === currentQuestion?.correctAnswer;
  const isLastQuestion = currentIndex + 1 >= questions.length;

  return (
    <div className="flex flex-col gap-4 px-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-mono text-muted-foreground">
          {currentIndex + 1}/{questions.length}
        </span>
        <Progress value={progress} className="flex-1 h-2" />
      </div>

      {/* Question card */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                currentQuestion.difficulty === "easy" &&
                  "bg-emerald-500/10 text-emerald-500",
                currentQuestion.difficulty === "medium" &&
                  "bg-amber-500/10 text-amber-500",
                currentQuestion.difficulty === "hard" &&
                  "bg-red-500/10 text-red-500"
              )}
            >
              {currentQuestion.difficulty}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {currentQuestion.category}
            </Badge>
          </div>
          <h2 className="text-lg font-semibold leading-snug">
            {currentQuestion.question}
          </h2>
        </CardContent>
      </Card>

      {/* Answer options */}
      <div className="flex flex-col gap-2">
        {answers.map((answer) => {
          const isCorrect = answer === currentQuestion.correctAnswer;
          const isSelected = answer === selectedAnswer;

          return (
            <button
              key={answer}
              onClick={() => handleAnswer(answer)}
              disabled={showResult}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all",
                !showResult &&
                  "hover:border-primary/50 hover:bg-accent active:scale-[0.98]",
                showResult &&
                  isCorrect &&
                  "border-emerald-500 bg-emerald-500/10",
                showResult &&
                  isSelected &&
                  !isCorrect &&
                  "border-red-500 bg-red-500/10",
                showResult && !isSelected && !isCorrect && "opacity-50"
              )}
            >
              <span className="flex-1 text-sm font-medium">{answer}</span>
              {showResult && isCorrect && (
                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
              )}
              {showResult && isSelected && !isCorrect && (
                <XCircle className="h-5 w-5 shrink-0 text-red-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Inline explanation + next button (shown after answering) */}
      {showResult && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card
            className={cn(
              "border",
              isCorrectAnswer
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-red-500/30 bg-red-500/5"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                {isCorrectAnswer ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span className="font-bold text-emerald-500">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="font-bold text-red-500">Incorrect</span>
                  </>
                )}
              </div>
              {!isCorrectAnswer && (
                <p className="mt-2 text-sm">
                  <span className="text-muted-foreground">Answer: </span>
                  <span className="font-semibold">
                    {currentQuestion.correctAnswer}
                  </span>
                </p>
              )}
              {currentQuestion.explanation && (
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              )}
            </CardContent>
          </Card>

          <Button
            onClick={() => advanceToNext()}
            className="mt-3 w-full gap-2"
          >
            {autoProgress && isCorrectAnswer && autoProgressCountdown > 0 ? (
              <>
                Next in {Math.ceil(autoProgressCountdown / 1000)}s
                <span className="text-xs text-primary-foreground/60">
                  (tap to skip)
                </span>
              </>
            ) : isLastQuestion ? (
              <>
                <Trophy className="h-4 w-4" />
                See Results
              </>
            ) : (
              <>
                Next Question
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
