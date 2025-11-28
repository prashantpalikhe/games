export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Country {
  code: string;
  name: string;
  continent: string;
  difficulty: Difficulty;
  description: string;
  capital?: string;
}

export interface GameMode {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface Question {
  correctOption: Country;
  options: Country[]; // 4 options usually
  type?: 'flag' | 'capital' | 'reverse' | 'description';
}

export interface AnswerAttempt {
  question: Question;
  userAnswer: Country | string | null;
  type: 'correct' | 'incorrect' | 'timeout';
  timestamp: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  region: string; // 'World' or specific continent
}

export interface GameState {
  status: 'idle' | 'playing' | 'ended';
  mode: string;
  score: number;
  highScore: number;
  lives: number;
  streak: number;
  queue: Country[];
  currentIndex: number;
  currentQuestion: Question | null;
  feedback: 'correct' | 'incorrect' | 'timeout' | null;
  lastFeedback: 'correct' | 'incorrect' | 'timeout' | null; // For transitions
  timeLeft: number; // For Blitz
  wrongAnswers: AnswerAttempt[];
}

export interface CollectedFlags {
  [code: string]: number; // code -> count
}

