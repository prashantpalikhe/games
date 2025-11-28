<script setup lang="ts">
import { COUNTRIES } from "~/utils/game-data";
import { useGameStorage } from "~/composables/game/useGameStorage";
import { useGameSettings } from "~/composables/game/useGameSettings";

const storage = useGameStorage();
const { settings } = useGameSettings();

const totalCountries = COUNTRIES.length;
const highScore = storage.getHighScore("normal");
const showSettings = ref(false);
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in relative">
    <!-- Settings Button -->
    <button
      class="absolute right-4 top-2 size-10 p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-full text-gray-500 hover:text-gray-700 transition-colors shadow-sm"
      @click="showSettings = true"
    >
      <Icon name="lucide:settings" class="w-6 h-6" />
    </button>

    <!-- Logo -->
    <div class="mb-8 animate-bounce-custom">
      <AppLogo />
    </div>

    <h1 class="text-4xl font-extrabold text-gray-800 mb-4">Flag Master</h1>
    <p class="text-gray-500 text-lg mb-8 max-w-md">
      Master all {{ totalCountries }} flags of the world in one endless run!
    </p>

    <!-- High Score Badge -->
    <div
      v-if="highScore > 0"
      class="mb-8 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-bold inline-flex gap-2 items-center shadow-sm"
    >
      <Icon name="lucide:trophy" class="w-5 h-5 text-yellow-600" />
      Best Score: {{ highScore }}
    </div>

    <!-- Region Selector (Stub - could use another sheet later) -->
    <button
      class="mb-6 px-5 py-2 bg-white border-2 border-gray-200 rounded-full text-gray-700 font-bold gap-2 flex items-center shadow-sm hover:bg-gray-50 transition-colors no-select"
      @click="showSettings = true"
    >
      <Icon name="lucide:globe" class="w-5 h-5 text-blue-500" />
      Region: {{ settings.region }}
    </button>

    <!-- Game Modes Carousel -->
    <AppGameModes />

    <!-- Passport Link -->
    <NuxtLink
      to="/passport"
      class="mt-6 text-blue-500 font-bold flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-blue-50 transition-colors"
    >
      <Icon name="lucide:book" class="w-5 h-5" />
      <span>My Passport</span>
    </NuxtLink>

    <SettingsSheet v-model:open="showSettings" />
  </div>
</template>
