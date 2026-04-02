"use client";

import { useEffect } from "react";
import { preloadAllQuestions } from "@/lib/question-loader";

/** Preloads all question data in the background after initial render */
export function QuestionPreloader() {
  useEffect(() => {
    // Use requestIdleCallback to avoid blocking the main thread,
    // falling back to a short timeout for Safari
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => preloadAllQuestions());
    } else {
      setTimeout(() => preloadAllQuestions(), 1000);
    }
  }, []);

  return null;
}
