<template>
  <div class="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in relative">
    <button
      class="absolute right-4 top-2 size-10 p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-full text-gray-500 hover:text-gray-700 transition-colors shadow-sm"
    >
      <Icon name="lucide:settings" />
    </button>

    <div class="mb-8 animate-bounce-custom">
      <AppLogo />
    </div>
    <h1 class="text-4xl font-extrabold text-gray-800 mb-4">Flag Master</h1>
    <p class="text-gray-500 text-lg mb-8 max-w-md">
      Master all {{ totalCountries }} flags of the world in one endless run!
    </p>

    <div
      v-if="highScore > 0"
      class="mb-8 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-bold inline-flex gap-2 items-center shadow-sm"
    >
      <Icon name="lucide:trophy" />

      Best Score: {{ highScore }}
    </div>

    <button
      class="mb-6 px-5 py-2 bg-white border-2 border-gray-200 rounded-full text-gray-700 font-bold gap-2 flex items-center shadow-sm hover:bg-gray-50 transition-colors no-select"
    >
      <Icon name="lucide:globe" />
      Region: {{ selectedRegion }}
    </button>

    <AppGameModes />

    <button
      class="mt-6 text-blue-500 font-bold flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-blue-50 transition-colors"
    >
      <Icon name="lucide:book" />
      <span>My Passport</span>
    </button>
  </div>
</template>

<script setup>
const totalCountries = 250;
const highScore = 10;
const selectedRegion = "World";
</script>
