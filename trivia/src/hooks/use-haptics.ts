"use client";

import { useWebHaptics } from "web-haptics/react";
import { useEffect, useState } from "react";
import { getSettings } from "@/lib/db";

export function useHaptics() {
  const { trigger, cancel } = useWebHaptics();
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    getSettings().then((s) => setEnabled(s.hapticsEnabled));
  }, []);

  return {
    /** Two taps — correct answer */
    success: () => enabled && trigger("success"),
    /** Three sharp taps — wrong answer */
    error: () => enabled && trigger("error"),
    /** Soft nudge — button press, selection */
    nudge: () => enabled && trigger("nudge"),
    /** Custom light tap */
    tap: () => enabled && trigger(15),
    cancel,
  };
}
