import confetti from 'canvas-confetti';

const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

export const useGameEffects = () => {

  const triggerConfetti = () => {
    if (import.meta.server) return;
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    // Celebratory burst pattern: buzz-pause-buzz-pause-long buzz
    vibrate([100, 50, 100, 50, 200]);
  };

  const triggerSchoolPride = () => {
    if (import.meta.server) return;
    const end = Date.now() + 1000;
    const colors = ['#bb0000', '#ffffff'];

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
    // Grand celebration pattern: three strong pulses ramping up, then a long triumphant buzz
    vibrate([150, 80, 200, 80, 250, 80, 400]);
  };

  return {
    triggerConfetti,
    triggerSchoolPride
  };
};

