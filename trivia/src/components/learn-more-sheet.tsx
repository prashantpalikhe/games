"use client";

import { useEffect, useRef } from "react";
import { Streamdown } from "streamdown";
import "streamdown/styles.css";
import { BookOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useOllamaStream } from "@/hooks/use-ollama-stream";
import type { Question } from "@/lib/types";

interface LearnMoreSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: Question;
  selectedAnswer: string;
  wasCorrect: boolean;
}

function buildPrompt(question: Question, selectedAnswer: string, wasCorrect: boolean): string {
  return `You are a trivia expert. The user was asked: "${question.question}"
The correct answer is: "${question.correctAnswer}"
The user answered: "${selectedAnswer}" which was ${wasCorrect ? "correct" : "incorrect"}.

Provide a brief, engaging explanation (2-3 short paragraphs) about why the correct answer is right. Include an interesting fact or context that helps the user remember this. Use markdown formatting. Be concise.`;
}

export function LearnMoreSheet({
  open,
  onOpenChange,
  question,
  selectedAnswer,
  wasCorrect,
}: LearnMoreSheetProps) {
  const { content, isStreaming, error, startStream, abort, reset } = useOllamaStream();
  const streamedQuestionId = useRef<string | null>(null);

  useEffect(() => {
    if (open && streamedQuestionId.current !== question.id) {
      streamedQuestionId.current = question.id;
      startStream(buildPrompt(question, selectedAnswer, wasCorrect));
    }

    if (!open) {
      abort();
    }
  }, [open, question, selectedAnswer, wasCorrect, startStream, abort]);

  // Reset tracked question when question changes (new question in quiz)
  useEffect(() => {
    streamedQuestionId.current = null;
    reset();
  }, [question.id, reset]);

  function handleRetry() {
    streamedQuestionId.current = null;
    startStream(buildPrompt(question, selectedAnswer, wasCorrect));
    streamedQuestionId.current = question.id;
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Learn More
          </DrawerTitle>
        </DrawerHeader>

        <div className="max-h-[60vh] overflow-y-auto px-4 pb-6">
          {/* Loading skeleton — before first token arrives */}
          {isStreaming && content.length === 0 && !error && (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/6" />
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 gap-1.5"
                onClick={handleRetry}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          )}

          {/* Streamed markdown content */}
          {content.length > 0 && (
            <Streamdown animated isAnimating={isStreaming}>
              {content}
            </Streamdown>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
