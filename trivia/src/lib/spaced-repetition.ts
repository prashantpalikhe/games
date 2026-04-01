import type { CardState } from "./types";

/**
 * SM-2 Spaced Repetition Algorithm
 *
 * Quality ratings:
 * 0 - Complete blackout
 * 1 - Incorrect; correct answer remembered upon seeing it
 * 2 - Incorrect; correct answer seemed easy to recall
 * 3 - Correct with significant difficulty
 * 4 - Correct after hesitation
 * 5 - Perfect recall
 */

export function createInitialCardState(questionId: string): CardState {
  return {
    questionId,
    ef: 2.5,
    repetitions: 0,
    interval: 0,
    nextReview: new Date().toISOString(),
    lastQuality: 0,
    totalAttempts: 0,
    correctAttempts: 0,
  };
}

export function processReview(
  card: CardState,
  quality: number,
  correct: boolean
): CardState {
  const q = Math.max(0, Math.min(5, quality));

  const newCard = { ...card };
  newCard.totalAttempts += 1;
  if (correct) newCard.correctAttempts += 1;
  newCard.lastQuality = q;

  if (q < 3) {
    // Failed: reset repetitions but keep EF
    newCard.repetitions = 0;
    newCard.interval = 0;
  } else {
    // Passed
    if (newCard.repetitions === 0) {
      newCard.interval = 1;
    } else if (newCard.repetitions === 1) {
      newCard.interval = 6;
    } else {
      newCard.interval = Math.round(newCard.interval * newCard.ef);
    }
    newCard.repetitions += 1;
  }

  // Update easiness factor
  newCard.ef = Math.max(
    1.3,
    newCard.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  );

  // Set next review date
  const nextDate = new Date();
  if (newCard.interval === 0) {
    // Review again in 10 minutes for failed cards
    nextDate.setMinutes(nextDate.getMinutes() + 10);
  } else {
    nextDate.setDate(nextDate.getDate() + newCard.interval);
  }
  newCard.nextReview = nextDate.toISOString();

  return newCard;
}

/** Convert a correct/incorrect + time to an SM-2 quality rating */
export function calculateQuality(
  correct: boolean,
  responseTimeMs: number
): number {
  if (!correct) {
    return responseTimeMs < 3000 ? 1 : 0;
  }
  if (responseTimeMs < 3000) return 5;
  if (responseTimeMs < 6000) return 4;
  return 3;
}

/** Get mastery level for display */
export function getMasteryLevel(
  card: CardState
): "new" | "learning" | "reviewing" | "mastered" {
  if (card.totalAttempts === 0) return "new";
  if (card.repetitions < 2) return "learning";
  if (card.interval >= 21) return "mastered";
  return "reviewing";
}
