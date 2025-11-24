<template>
    <NuxtLayout name="game">
      <div class="flex flex-col h-full p-6 items-center justify-center text-center animate-pop-in">
        
        <div class="mb-6 relative">
          <Icon 
            :name="state.score > 0 ? 'heroicons:trophy-solid' : 'heroicons:face-frown-solid'" 
            class="w-32 h-32"
            :class="state.score > 0 ? 'text-duo-yellow' : 'text-gray-300'"
          />
        </div>
  
        <h2 class="text-3xl font-extrabold text-gray-800 mb-2">
          {{ state.score > 0 ? 'World Master!' : 'Good Attempt!' }}
        </h2>
  
        <div class="bg-gray-50 p-6 rounded-2xl w-full border-2 border-gray-200 mb-8">
          <div class="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
            <span class="font-bold text-gray-500">Total Score</span>
            <span class="text-2xl font-black text-duo-blue">{{ state.score }}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="font-bold text-gray-500">Best Score</span>
            <span class="text-2xl font-black text-duo-yellow">{{ state.highScore }}</span>
          </div>
        </div>
  
        <div class="w-full space-y-3">
          <DuoButton 
            v-if="mistakeCount > 0"
            color="red" 
            @click="router.push('/review')"
          >
            REVIEW {{ mistakeCount }} MISTAKES
          </DuoButton>
  
          <DuoButton color="green" size="xl" @click="router.push('/')">
            PLAY AGAIN
          </DuoButton>
  
          <DuoButton color="yellow" @click="share">
            SHARE SCORE
          </DuoButton>
        </div>
  
      </div>
    </NuxtLayout>
  </template>
  
  <script setup lang="ts">
  const { state } = useGameEngine()
  const router = useRouter()
  
  const mistakeCount = computed(() => state.value.history.filter(h => !h.correct).length)
  
  const share = async () => {
    const text = `I scored ${state.value.score} points in Flag Master! 🏳️ Can you beat me?`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Flag Master', text, url: window.location.href })
      } catch (e) { console.log('Share cancelled') }
    } else {
      await navigator.clipboard.writeText(text)
      alert('Score copied to clipboard!')
    }
  }
  </script>