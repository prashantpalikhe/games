<script setup lang="ts">
import { GAME_MODES } from "~/utils/game-data";
</script>

<template>
  <div class="w-full overflow-x-auto pb-4 px-4 -mx-4 flex space-x-4 snap-x snap-mandatory no-scrollbar">
    <NuxtLink
      v-for="mode in GAME_MODES"
      :key="mode.id"
      :to="`/game/${mode.id}`"
      class="flex-shrink-0 w-40 h-48 rounded-2xl p-4 flex flex-col items-center justify-between border-b-4 active:border-b-0 active:translate-y-1 transition-all shadow-md snap-center relative overflow-hidden cursor-pointer no-select"
      :class="{
        'bg-green-500 border-green-700 hover:bg-green-600': mode.color === 'green',
        'bg-purple-500 border-purple-700 hover:bg-purple-600': mode.color === 'purple',
        'bg-red-500 border-red-700 hover:bg-red-600': mode.color === 'red',
        'bg-blue-500 border-blue-700 hover:bg-blue-600': mode.color === 'blue',
        'bg-pink-500 border-pink-700 hover:bg-pink-600': mode.color === 'pink',
      }"
    >
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="text-white opacity-90 transform scale-125 mt-4" v-html="mode.icon"></div>

      <div class="text-center text-white">
        <div class="text-xl font-black uppercase tracking-wide mb-1">{{ mode.name }}</div>
        <div class="text-xs font-medium opacity-90 leading-tight">{{ mode.description }}</div>
      </div>

      <div class="w-8 h-1 bg-white/30 rounded-full mb-2" />
    </NuxtLink>
  </div>
</template>
