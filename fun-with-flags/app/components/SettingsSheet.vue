<script setup lang="ts">
import { useGameSettings } from "~/composables/game/useGameSettings";
import { COUNTRIES } from "~/utils/game-data";

const isOpen = defineModel<boolean>("open", { default: false });
const { settings, updateSettings } = useGameSettings();

const regions = ["World", "Africa", "Asia", "Europe", "North America", "Oceania", "South America"];

const regionCounts = computed(() => {
  const counts: Record<string, number> = {};
  for (const region of regions) {
    if (region === "World") {
      counts[region] = COUNTRIES.length;
    } else {
      counts[region] = COUNTRIES.filter((c) => c.continent === region).length;
    }
  }
  return counts;
});

const toggleSound = () => {
  updateSettings({ soundEnabled: !settings.value.soundEnabled });
};

const selectRegion = (region: string) => {
  updateSettings({ region });
};
</script>

<template>
  <AppBottomSheet v-model="isOpen" title="Settings">
    <div class="flex flex-col space-y-6">
      <!-- Sound Toggle -->
      <button
        class="py-4 px-4 rounded-xl font-bold text-left transition-all flex justify-between items-center border-2"
        :class="
          settings.soundEnabled ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-600'
        "
        @click="toggleSound"
      >
        <div class="flex items-center space-x-3">
          <Icon :name="settings.soundEnabled ? 'lucide:volume-2' : 'lucide:volume-x'" class="w-6 h-6" />
          <span>Sound Effects</span>
        </div>

        <div
          class="w-12 h-6 rounded-full relative transition-colors duration-200"
          :class="settings.soundEnabled ? 'bg-blue-500' : 'bg-gray-300'"
        >
          <div
            class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200"
            :class="settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'"
          />
        </div>
      </button>

      <!-- Region Selector -->
      <div class="space-y-3">
        <div class="text-left">
          <p class="text-gray-700 font-bold">Region</p>
          <p class="text-xs text-gray-400">Focus on a continent or play World mode</p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="region in regions"
            :key="region"
            class="py-3 px-4 rounded-xl font-bold text-left transition-all flex justify-between items-center border-2"
            :class="
              settings.region === region
                ? 'bg-green-50 border-green-500 text-green-700'
                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
            "
            @click="selectRegion(region)"
          >
            <div>
              <div class="text-sm">{{ region }}</div>
              <div v-if="region !== 'World'" class="text-[11px] text-gray-400 font-medium">
                {{ regionCounts[region] }} countries
              </div>
            </div>
            <Icon v-if="settings.region === region" name="lucide:check" class="w-5 h-5 text-green-500" />
          </button>
        </div>
      </div>
    </div>
  </AppBottomSheet>
</template>
