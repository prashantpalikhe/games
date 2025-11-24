export const useAudio = () => {
    const audioContext = ref<AudioContext | null>(null)
    const { loadSettings } = usePersistence()
    const soundEnabled = ref(true)
  
    const initAudio = async () => {
      const settings = await loadSettings()
      soundEnabled.value = settings.sound ?? true
  
      if (!audioContext.value) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        if (AudioContext) {
          audioContext.value = new AudioContext()
        }
      }
      if (audioContext.value?.state === 'suspended') {
        await audioContext.value.resume()
      }
    }
  
    const playSound = (type: 'correct' | 'incorrect' | 'tick' | 'win') => {
      if (!soundEnabled.value || !audioContext.value) return
  
      const ctx = audioContext.value
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
  
      osc.connect(gain)
      gain.connect(ctx.destination)
  
      const now = ctx.currentTime
  
      if (type === 'correct') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(523.25, now) 
        osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.1)
        gain.gain.setValueAtTime(0.3, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
        osc.start(now)
        osc.stop(now + 0.3)
      } else if (type === 'incorrect') {
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(150, now)
        osc.frequency.linearRampToValueAtTime(100, now + 0.2)
        gain.gain.setValueAtTime(0.3, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
        osc.start(now)
        osc.stop(now + 0.3)
      } else if (type === 'tick') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(800, now)
        gain.gain.setValueAtTime(0.1, now)
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05)
        osc.start(now)
        osc.stop(now + 0.05)
      } else if (type === 'win') {
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(523.25, now)
        osc.frequency.setValueAtTime(659.25, now + 0.1)
        osc.frequency.setValueAtTime(783.99, now + 0.2)
        osc.frequency.setValueAtTime(1046.50, now + 0.3)
        gain.gain.setValueAtTime(0.2, now)
        gain.gain.linearRampToValueAtTime(0, now + 0.6)
        osc.start(now)
        osc.stop(now + 0.6)
      }
    }
  
    const toggleSound = async (enabled: boolean) => {
      soundEnabled.value = enabled
    }
  
    return {
      initAudio,
      playSound,
      toggleSound,
      soundEnabled
    }
  }