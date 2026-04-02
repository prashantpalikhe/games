"use client";

import { useState, useRef, useCallback } from "react";

const OLLAMA_URL = "https://prashants-macbook-pro-2.tail5b59b0.ts.net/api/generate";
const OLLAMA_MODEL = "qwen3.5";

export function useOllamaStream() {
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const contentRef = useRef("");

  const abort = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  const reset = useCallback(() => {
    abort();
    setContent("");
    setIsStreaming(false);
    setError(null);
    contentRef.current = "";
  }, [abort]);

  const startStream = useCallback(
    async (prompt: string) => {
      // Reset previous state
      abort();
      contentRef.current = "";
      setContent("");
      setError(null);
      setIsStreaming(true);

      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const res = await fetch(OLLAMA_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: OLLAMA_MODEL,
            prompt,
            stream: true,
            options: { num_predict: 512 },
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Ollama returned ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          // Keep last incomplete line in buffer
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const json = JSON.parse(line);
              if (json.response) {
                contentRef.current += json.response;
                setContent(contentRef.current);
              }
              if (json.done) break;
            } catch {
              // Skip malformed JSON lines
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          // Intentional abort — not an error
          return;
        }
        setError(
          err instanceof Error
            ? err.message
            : "Could not connect to AI service"
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [abort]
  );

  return { content, isStreaming, error, startStream, abort, reset };
}
