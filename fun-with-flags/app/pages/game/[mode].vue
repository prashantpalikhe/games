<script setup lang="ts">
import { useGame } from "~/composables/game/useGame";

const route = useRoute();
const mode = route.params.mode as string;
const { initGame, isGameOver } = useGame();

// Initialize game on mount
onMounted(() => {
  initGame(mode);
});
</script>

<template>
  <NuxtLayout name="game">
    <div v-if="!isGameOver" class="h-full flex flex-col">
      <GameBoard />
    </div>

    <GameEndScreen v-else />
  </NuxtLayout>
</template>
