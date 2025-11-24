import confetti from 'canvas-confetti'

export const useCelebration = () => {
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#58cc02', '#1cb0f6', '#ff4b4b', '#ffc800'] 
    })
  }

  const triggerWin = () => {
    const end = Date.now() + 1000
    const colors = ['#58cc02', '#1cb0f6']

    ;(function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    })()
  }

  return {
    triggerConfetti,
    triggerWin
  }
}