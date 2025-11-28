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

    if (onTick) {
      onTick(timeLeft.value);
    }

    timerInterval = setInterval(() => {
      timeLeft.value = parseFloat(Math.max(0, timeLeft.value - 0.05).toFixed(2));

      if (onTick) {
        onTick(timeLeft.value);
      }

      if (timeLeft.value === 0) {
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

