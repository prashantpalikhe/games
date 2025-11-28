<script setup lang="ts">
import { useGame } from "~/composables/game/useGame";

const { state, progress, quitGame } = useGame();
const router = useRouter();

const handleQuit = () => {
  quitGame();
  router.push("/");
};

const livesIcon = computed(() => (state.value.lives > 0 ? "lucide:heart" : "lucide:heart-off"));
</script>

<template>
  <div class="pt-6 pb-6 px-4 flex flex-col bg-white z-10 safe-top border-b border-gray-100">
    <div class="flex items-center justify-between w-full">
      <!-- Quit Button -->
      <button
        @click="handleQuit"
        class="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors"
      >
        <Icon name="lucide:x" class="w-6 h-6" />
      </button>

      <div class="flex-1 mx-4 flex items-center space-x-3">
        <!-- Progress Bar -->
        <div class="flex-1 relative h-4">
          <div class="absolute inset-0 bg-gray-200 rounded-full overflow-hidden border border-gray-300/50">
            <div
              class="h-full transition-all duration-500 ease-out rounded-full bg-blue-500"
              :style="{ width: progress + '%' }"
            ></div>
          </div>
        </div>

        <!-- Score -->
        <div class="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-md min-w-[60px] text-center">
          {{ state.score }}
        </div>
      </div>

      <!-- Lives -->
      <div class="flex items-center space-x-1">
        <Icon
          :name="livesIcon"
          class="w-5 h-5"
          :class="state.lives > 0 ? 'text-red-500 fill-red-500' : 'text-gray-300'"
        />
        <span class="text-xl font-bold text-red-500">{{ state.lives }}</span>
      </div>
    </div>

    <!-- Timer Bar (for Blitz mode) -->
    <div v-if="state.mode === 'blitz' && state.timeLeft > 0" class="w-full mt-3">
      <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full transition-all duration-100 ease-linear"
          :class="state.timeLeft < 2 ? 'bg-red-600 animate-pulse' : 'bg-orange-500'"
          :style="{ width: (state.timeLeft / 5) * 100 + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>
