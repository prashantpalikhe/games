<script setup lang="ts">
import { useGame } from '~/composables/game/useGame';
import { useGameEffects } from '~/composables/game/useGameEffects';

const { state, initGame, quitGame } = useGame();
const { triggerSchoolPride } = useGameEffects();
const router = useRouter();

const showMistakes = ref(false);
const isNewHighScore = computed(() => state.value.score >= state.value.highScore && state.value.score > 0);

onMounted(() => {
  if (isNewHighScore.value) {
    triggerSchoolPride();
  }
});

const handlePlayAgain = () => {
  initGame(state.value.mode);
};

const handleExit = () => {
  quitGame();
  router.push('/');
};

const handleShare = async () => {
  const text = `I scored ${state.value.score} points in Flag Master! 🏳️ Can you beat me?`;
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Flag Master Score',
        text,
        url: window.location.href
      });
    } catch (e) {
      // Ignore
    }
  } else {
    try {
      await navigator.clipboard.writeText(text);
      alert('Score copied to clipboard!');
    } catch (e) {
      // Ignore
    }
  }
};
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in">
    
    <div class="mb-6 text-gray-300">
      <Icon 
        :name="state.lives > 0 ? 'lucide:trophy' : 'lucide:heart-off'" 
        class="w-32 h-32"
        :class="state.lives > 0 ? 'text-yellow-400' : 'text-gray-300'"
      />
    </div>

    <h2 class="text-3xl font-extrabold text-gray-800 mb-2">
      {{ state.lives > 0 ? 'World Master!' : 'Out of Hearts!' }}
    </h2>

    <div class="bg-gray-100 p-6 rounded-2xl w-full max-w-sm mb-8 border-2 border-gray-200">
      <div class="flex justify-between items-center mb-4 border-b pb-4 border-gray-300">
        <span class="text-gray-600 font-bold">Total Score</span>
        <span class="text-2xl font-extrabold text-blue-500">{{ state.score }}</span>
      </div>
      
      <div class="flex justify-between items-center mb-4 border-b pb-4 border-gray-300">
        <span class="text-gray-600 font-bold">Best Score</span>
        <div class="flex items-center">
          <span v-if="isNewHighScore" class="mr-2 text-xs bg-yellow-400 text-white px-2 py-1 rounded-full font-bold animate-pulse">NEW!</span>
          <span class="text-2xl font-extrabold text-yellow-600">{{ state.highScore }}</span>
        </div>
      </div>

      <div class="flex justify-between items-center">
        <span class="text-gray-600 font-bold">Flags Identified</span>
        <span class="text-xl font-extrabold text-green-500">{{ state.currentIndex }} / {{ state.queue.length }}</span>
      </div>
    </div>

    <!-- Mistakes Button -->
    <button
      v-if="state.wrongAnswers.length > 0"
      @click="showMistakes = true"
      class="mb-6 px-6 py-3 bg-white border-2 border-red-100 rounded-xl text-red-500 font-bold flex items-center shadow-sm hover:bg-red-50 transition-all w-full max-w-xs justify-center group"
    >
      <Icon name="lucide:alert-circle" class="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
      <span>Review {{ state.wrongAnswers.length }} Mistakes</span>
    </button>

    <!-- Actions -->
    <div class="w-full max-w-xs space-y-4">
      <button
        @click="handlePlayAgain"
        class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-2xl border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all shadow-lg text-lg uppercase tracking-wide flex items-center justify-center gap-2"
      >
        <Icon name="lucide:rotate-ccw" class="w-6 h-6" />
        <span>Try Again</span>
      </button>

      <button
        @click="handleShare"
        class="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-3 px-8 rounded-2xl border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all shadow-md text-lg uppercase tracking-wide flex items-center justify-center gap-2"
      >
        <Icon name="lucide:share-2" class="w-6 h-6" />
        <span>Share Score</span>
      </button>
      
      <button
        @click="handleExit"
        class="w-full text-gray-400 hover:text-gray-600 font-bold py-2 transition-colors"
      >
        Exit to Home
      </button>
    </div>

    <GameMistakesModal v-model:open="showMistakes" />
  </div>
</template>

