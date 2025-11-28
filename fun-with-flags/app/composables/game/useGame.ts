import { COUNTRIES, GAME_MODES } from '~/utils/game-data';
import { shuffleArray } from '~/utils/game/random';
import { getGameModeStrategy } from '~/utils/game/modes';
import { useGameStorage } from './useGameStorage';
import { useGameAudio } from './useGameAudio';
import { useGameTimer } from './useGameTimer';
import { useGameEffects } from './useGameEffects';
import type { GameState, Country, Question } from '~/types/game';

// Define the singleton state outside the function to ensure it's shared
// But in Nuxt, useState() handles this key-based sharing.
// We will use useState inside the composable.

export const useGame = () => {
  // --- Dependencies ---
  const storage = useGameStorage();
  const audio = useGameAudio();
  const timer = useGameTimer();
  const effects = useGameEffects();

  // --- State ---
  const state = useState<GameState>('game_state', () => ({
    status: 'idle',
    mode: 'normal',
    score: 0,
    highScore: 0,
    lives: 3,
    streak: 0,
    queue: [],
    currentIndex: 0,
    currentQuestion: null,
    feedback: null,
    lastFeedback: null,
    timeLeft: 0,
    wrongAnswers: [],
  }));

  // --- Getters ---
  const currentStrategy = computed(() => getGameModeStrategy(state.value.mode));
  const progress = computed(() => {
    if (state.value.queue.length === 0) return 0;
    return (state.value.currentIndex / state.value.queue.length) * 100;
  });
  const isGameOver = computed(() => state.value.status === 'ended');

  // --- Actions ---

  const initGame = (modeId: string = 'normal') => {
    // 1. Setup Audio
    audio.initAudio();

    // 2. Load Settings & Data
    const settings = storage.getSettings();
    let pool = [...COUNTRIES];
    
    // Region Filter
    if (settings.region && settings.region !== 'World') {
      pool = pool.filter(c => c.continent === settings.region);
    }

    // 3. Reset State
    state.value.status = 'playing';
    state.value.mode = modeId;
    state.value.score = 0;
    state.value.highScore = storage.getHighScore(modeId);
    state.value.streak = 0;
    state.value.wrongAnswers = [];
    state.value.currentIndex = 0;
    state.value.queue = shuffleArray(pool);
    state.value.feedback = null;
    
    // 4. Apply Mode Strategy Init
    const strategy = getGameModeStrategy(modeId);
    state.value.lives = strategy.lives;

    // 5. Generate First Question
    nextQuestion();
  };

  const nextQuestion = () => {
    if (state.value.lives <= 0 || state.value.currentIndex >= state.value.queue.length) {
      endGame();
      return;
    }

    const target = state.value.queue[state.value.currentIndex];
    const strategy = currentStrategy.value;
    
    state.value.currentQuestion = strategy.getQuestion(target, state.value.queue, state.value);
    state.value.feedback = null;

    // Start Timer if Blitz
    if (strategy.timeLimit) {
      timer.startTimer(
        strategy.timeLimit,
        (t) => { state.value.timeLeft = t; if(t <= 3) audio.playSound('tick'); },
        () => handleTimeout()
      );
    }
  };

  const handleTimeout = () => {
    if (state.value.feedback) return; // Already answered

    state.value.feedback = 'timeout';
    state.value.lastFeedback = 'timeout';
    state.value.lives = 0; // Sudden death for blitz usually, or check strategy
    
    audio.playSound('incorrect');
    
    // Record mistake
    if (state.value.currentQuestion) {
      state.value.wrongAnswers.push({
        question: state.value.currentQuestion,
        userAnswer: null,
        type: 'timeout',
        timestamp: Date.now()
      });
    }

    setTimeout(() => endGame(), 1000);
  };

  const submitAnswer = (answer: Country | string) => {
    if (state.value.feedback) return; // Prevent double submit
    if (!state.value.currentQuestion) return;

    timer.stopTimer();

    const strategy = currentStrategy.value;
    const isCorrect = strategy.validateAnswer(state.value.currentQuestion, answer);

    if (isCorrect) {
      // Correct
      state.value.feedback = 'correct';
      state.value.lastFeedback = 'correct';
      audio.playSound('correct');
      
      // Score
      const points = strategy.calculateScore(timer.timeLeft.value, state.value.streak);
      state.value.score += points;
      state.value.streak++;

      // Update High Score immediately if beaten
      if (state.value.score > state.value.highScore) {
        state.value.highScore = state.value.score;
        storage.saveHighScore(state.value.mode, state.value.score);
      }

      // Effects: Confetti for streaks or milestones
      if (state.value.streak > 0 && state.value.streak % 5 === 0) {
        effects.triggerConfetti();
      }

      // Update Collection (Passport)
      const correctCode = state.value.currentQuestion.correctOption.code;
      const collection = storage.getCollection();
      collection[correctCode] = (collection[correctCode] || 0) + 1;
      storage.saveCollection(collection);

      // Auto advance (delay for visual feedback)
      setTimeout(() => {
        state.value.currentIndex++;
        nextQuestion();
      }, 1000); // 1s delay to see green feedback

    } else {
      // Incorrect
      state.value.feedback = 'incorrect';
      state.value.lastFeedback = 'incorrect';
      audio.playSound('incorrect');
      
      state.value.lives--;
      state.value.streak = 0;

      state.value.wrongAnswers.push({
        question: state.value.currentQuestion,
        userAnswer: answer,
        type: 'incorrect',
        timestamp: Date.now()
      });

      if (state.value.lives <= 0) {
        setTimeout(() => endGame(), 1000);
      } else {
        // Allow user to see correct answer then continue? 
        // Or just continue? 
        // Usually we pause to show correct answer.
        // But for now, let's auto advance like correct answer but with penalty
        // Or wait for user click? In index.html it waits for 'Continue' click on bottom sheet.
        // We will keep feedback state until user dismisses or auto?
        // The index.html waits for "Continue" button click.
        // So we should NOT auto-advance on error.
        // We need a `continueGame` method.
      }
    }
  };

  // Called by UI when "Continue" is clicked after error
  const continueGame = () => {
    if (state.value.lives <= 0) {
      endGame();
    } else {
      state.value.currentIndex++;
      nextQuestion();
    }
  };

  const endGame = () => {
    state.value.status = 'ended';
    timer.stopTimer();
    // Save final high score just in case
    if (state.value.score > storage.getHighScore(state.value.mode)) {
      storage.saveHighScore(state.value.mode, state.value.score);
    }
  };

  const quitGame = () => {
    state.value.status = 'idle';
    timer.stopTimer();
    state.value.currentQuestion = null;
    state.value.feedback = null;
  };

  return {
    state,
    progress,
    isGameOver,
    initGame,
    submitAnswer,
    continueGame,
    quitGame,
    gameModes: GAME_MODES // Re-export for UI
  };
};

