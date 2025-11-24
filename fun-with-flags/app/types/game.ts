export interface GameItem {
    id: string; // e.g., 'us', 'fr'
    name: string;
    iconCode?: string; // For NuxtIcon ('flag:us-4x3')
    metadata?: {
      continent?: string;
      capital?: string;
      [key: string]: any;
    };
    difficulty: 'easy' | 'medium' | 'hard';
  }
  
  export interface Question {
    id: string;
    correctItem: GameItem;
    options: GameItem[];
    type: 'identify' | 'reverse' | 'input' | 'capitals'; 
    effect?: string; // For mindfuck mode
  }
  
  export interface GameState {
    score: number;
    lives: number;
    streak: number;
    highScore: number;
    status: 'idle' | 'playing' | 'game-over';
    history: GameHistoryItem[];
    timer?: number; // For Blitz mode
  }
  
  export interface GameHistoryItem {
    questionId: string;
    itemId: string; // The item asked
    correct: boolean;
    userAnswer: string | GameItem; // What they answered
    correctAnswer: string | GameItem;
    type: string;
    _rawCorrect?: GameItem;
  }
  
  export type GameMode = 'normal' | 'reverse' | 'blitz' | 'hard' | 'capitals' | 'mindfuck';