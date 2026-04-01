"use client";

import { useEffect, useRef, useState } from "react";
import { getSettings } from "@/lib/db";

// Generate sounds using Web Audio API — no external audio files needed
function createAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.3
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    getSettings().then((s) => setEnabled(s.soundEnabled));
  }, []);

  function getCtx(): AudioContext | null {
    if (!ctxRef.current) {
      ctxRef.current = createAudioContext();
    }
    // Resume if suspended (browsers require user gesture)
    if (ctxRef.current?.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }

  return {
    /** Ascending two-tone chime — correct answer */
    correct: () => {
      if (!enabled) return;
      const ctx = getCtx();
      if (!ctx) return;
      playTone(ctx, 523.25, 0.15, "sine", 0.25); // C5
      setTimeout(() => playTone(ctx, 659.25, 0.2, "sine", 0.25), 120); // E5
    },

    /** Descending low buzz — wrong answer */
    wrong: () => {
      if (!enabled) return;
      const ctx = getCtx();
      if (!ctx) return;
      playTone(ctx, 200, 0.15, "square", 0.15);
      setTimeout(() => playTone(ctx, 150, 0.25, "square", 0.12), 120);
    },

    /** Light click — button tap */
    tap: () => {
      if (!enabled) return;
      const ctx = getCtx();
      if (!ctx) return;
      playTone(ctx, 800, 0.05, "sine", 0.1);
    },

    /** Celebration fanfare — session complete */
    celebration: () => {
      if (!enabled) return;
      const ctx = getCtx();
      if (!ctx) return;
      playTone(ctx, 523.25, 0.12, "sine", 0.2); // C5
      setTimeout(() => playTone(ctx, 659.25, 0.12, "sine", 0.2), 100); // E5
      setTimeout(() => playTone(ctx, 783.99, 0.12, "sine", 0.2), 200); // G5
      setTimeout(() => playTone(ctx, 1046.5, 0.3, "sine", 0.25), 300); // C6
    },
  };
}
