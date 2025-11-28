<script setup lang="ts">
import { COUNTRIES } from '~/utils/game-data';
import { useGameStorage } from '~/composables/game/useGameStorage';

const storage = useGameStorage();
const collection = ref(storage.getCollection());

const continents = ['Africa', 'Asia', 'Europe', 'North America', 'Oceania', 'South America'];

const getRegionStats = (region: string) => {
  const regionCountries = COUNTRIES.filter(c => c.continent === region);
  const collectedCount = regionCountries.filter(c => collection.value[c.code]).length;
  const percentage = Math.round((collectedCount / regionCountries.length) * 100);
  return { collectedCount, total: regionCountries.length, percentage };
};

const totalCollected = computed(() => Object.keys(collection.value).length);
const totalCountries = COUNTRIES.length;
</script>

<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm px-4 py-4 z-10 flex items-center justify-between safe-top sticky top-0">
      <div class="flex items-center space-x-3">
        <NuxtLink to="/" class="text-gray-500 hover:text-gray-700 bg-gray-100 p-2 rounded-full transition-colors">
          <Icon name="lucide:arrow-left" class="w-6 h-6" />
        </NuxtLink>
        <h2 class="text-xl font-bold text-gray-800">My Passport</h2>
      </div>
      <div class="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
        {{ totalCollected }} / {{ totalCountries }}
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-4">
      <!-- Region Stats -->
      <div class="grid grid-cols-2 gap-2 mb-6">
        <div
          v-for="region in continents"
          :key="region"
          class="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center"
        >
          <span class="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{{ region }}</span>
          <span
            class="text-lg font-extrabold"
            :class="getRegionStats(region).percentage === 100 ? 'text-green-500' : 'text-gray-700'"
          >
            {{ getRegionStats(region).percentage }}%
          </span>
          <div class="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
            <div
              class="h-full bg-green-500 rounded-full transition-all duration-500"
              :style="{ width: getRegionStats(region).percentage + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Flags Grid -->
      <div class="grid grid-cols-4 gap-3 pb-8">
        <div
          v-for="country in COUNTRIES"
          :key="country.code"
          class="aspect-square rounded-xl flex items-center justify-center relative overflow-hidden border-2 transition-all bg-white"
          :class="collection[country.code] ? 'border-blue-200 shadow-sm' : 'border-gray-200 opacity-40'"
        >
          <img
            v-if="collection[country.code]"
            :src="`https://flagcdn.com/w160/${country.code}.png`"
            loading="lazy"
            class="w-full h-full object-cover"
            :alt="country.name"
          />
          <span v-else class="text-2xl text-gray-300 font-bold">?</span>

          <!-- Count Badge -->
          <div
            v-if="collection[country.code] && collection[country.code] > 1"
            class="absolute bottom-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-tl-lg"
          >
            {{ collection[country.code] }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

