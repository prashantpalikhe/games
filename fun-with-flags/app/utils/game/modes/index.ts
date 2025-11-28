import type { Country, Question, GameState } from '~/types/game';
import { generateQuestion } from '../question-generator';
import { levenshtein } from '../string';
import { COUNTRIES } from '~/utils/game-data';

// --- Strategy Interface ---
export interface GameModeStrategy {
  id: string;
  lives: number;
  timeLimit?: number; // seconds, if applicable
  
  // Generates the next question based on current state/queue
  getQuestion(target: Country, queue: Country[], state: GameState): Question;
  
  // Validates answer (returns true/false and optional feedback details)
  validateAnswer(question: Question, answer: Country | string): boolean;
  
  // Calculates score for a correct answer
  calculateScore(timeLeft: number, streak: number): number;
}

// --- Base Implementation ---
abstract class BaseMode implements GameModeStrategy {
  abstract id: string;
  abstract lives: number;

  getQuestion(target: Country, queue: Country[], state: GameState): Question {
    // Default behavior: standard question generation
    // Use state settings for region filtering
    // We assume the queue is already filtered by region at start, but good to be safe
    return generateQuestion(target, COUNTRIES); 
  }

  validateAnswer(question: Question, answer: Country | string): boolean {
    if (typeof answer === 'string') return false; // Default modes expect Country object
    return question.correctOption.code === answer.code;
  }

  calculateScore(timeLeft: number, streak: number): number {
    return 10 + (streak * 2);
  }
}

// --- Normal Mode ---
export class NormalMode extends BaseMode {
  id = 'normal';
  lives = 3;
}

// --- Blitz Mode (Timed) ---
export class BlitzMode extends BaseMode {
  id = 'blitz';
  lives = 1; // Sudden death
  timeLimit = 5; // 5 seconds per flag

  calculateScore(timeLeft: number, streak: number): number {
    const base = 10 + (streak * 2);
    const timeBonus = Math.ceil(timeLeft * 10); // Big bonus for speed
    return base + timeBonus;
  }
}

// --- Hard Mode (Typing) ---
export class HardMode extends BaseMode {
  id = 'hard';
  lives = 3;

  validateAnswer(question: Question, answer: Country | string): boolean {
    if (typeof answer !== 'string') return false;
    
    const input = answer.trim().toLowerCase();
    const correct = question.correctOption.name.toLowerCase();
    
    // Exact match
    if (input === correct) return true;

    // Levenshtein fuzzy match
    // Allow 1 typo for short names, 2 for long names
    const maxDist = correct.length <= 4 ? 1 : 2;
    const dist = levenshtein(input, correct);
    
    return dist <= maxDist;
  }

  calculateScore(timeLeft: number, streak: number): number {
    return 20 + (streak * 2); // Higher base score for typing
  }
}

// --- Capitals Mode ---
export class CapitalsMode extends BaseMode {
  id = 'capitals';
  lives = 3;
  
  getQuestion(target: Country, queue: Country[], state: GameState): Question {
    const q = super.getQuestion(target, queue, state);
    q.type = 'capital'; // UI should render capital name instead of flag (or reversed)
    // Note: The original logic was: Show Flag -> Guess Capital (in text buttons)
    // Or: Show Capital -> Guess Flag?
    // index.html says: "What is the capital?" -> shows Flag, options are text (Capitals).
    return q;
  }
}

// --- Reverse Mode ---
export class ReverseMode extends BaseMode {
  id = 'reverse';
  lives = 3;

  getQuestion(target: Country, queue: Country[], state: GameState): Question {
    const q = super.getQuestion(target, queue, state);
    q.type = 'reverse'; // UI: Show Country Name -> Options are 4 Flags
    return q;
  }
}

// --- Factory ---
export const getGameModeStrategy = (modeId: string): GameModeStrategy => {
  switch (modeId) {
    case 'blitz': return new BlitzMode();
    case 'hard': return new HardMode();
    case 'capitals': return new CapitalsMode();
    case 'reverse': return new ReverseMode();
    case 'normal':
    default: 
      return new NormalMode();
  }
};

