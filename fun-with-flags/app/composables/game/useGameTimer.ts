export const useGameTimer = () => {
  const timeLeft = ref(0);
  const isRunning = ref(false);
  let timerInterval: NodeJS.Timeout | null = null;
  
  // Callbacks
  let onTick: ((time: number) => void) | null = null;
  let onEnd: (() => void) | null = null;

  const startTimer = (seconds: number, tickCallback?: (time: number) => void, endCallback?: () => void) => {
    stopTimer();
    timeLeft.value = seconds;
    isRunning.value = true;
    onTick = tickCallback || null;
    onEnd = endCallback || null;

    timerInterval = setInterval(() => {
      const oldTime = Math.ceil(timeLeft.value);
      timeLeft.value -= 0.05; // 50ms updates
      
      const newTime = Math.ceil(timeLeft.value);
      
      // Callback on full second changes (useful for sound effects)
      if (newTime < oldTime && onTick) {
        onTick(newTime);
      }

      if (timeLeft.value <= 0) {
        timeLeft.value = 0;
        stopTimer();
        if (onEnd) onEnd();
      }
    }, 50);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    isRunning.value = false;
  };

  onUnmounted(() => {
    stopTimer();
  });

  return {
    timeLeft,
    isRunning,
    startTimer,
    stopTimer
  };
};

