<template>
  <NuxtLayout name="game">
    <div class="flex flex-col h-full p-6 relative">
      <div class="flex justify-between items-center mb-8 mt-safe">
        <div class="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-bold flex items-center gap-2">
          <Icon name="heroicons:trophy-solid" class="w-5 h-5 text-yellow-500" />
          <span>Best: {{ highScore }}</span>
        </div>
        <button class="p-2 hover:bg-gray-50 rounded-full text-gray-400" @click="toggleSound(!soundEnabled)">
          <Icon
            :name="soundEnabled ? 'heroicons:speaker-wave-solid' : 'heroicons:speaker-x-mark-solid'"
            class="w-6 h-6"
          />
        </button>
      </div>

      <div class="flex-1 flex flex-col items-center justify-center text-center mb-12">
        <div class="mb-6 animate-bounce-press">
          <img src="~/assets/images/logo.png" alt="Fun with Flags" />
        </div>
        <h1 class="text-4xl font-extrabold text-gray-800 mb-2">Become a flag expert in no time!</h1>
      </div>

      <div class="space-y-4 mb-8">
        <DuoButton color="green" size="xl" @click="play('normal')"> START GAME </DuoButton>

        <DuoButton color="blue" @click="navigateTo('/passport')"> MY PASSPORT </DuoButton>
      </div>

      <div class="overflow-x-auto flex space-x-4 pb-4 -mx-6 px-6 scrollbar-hide">
        <button
          v-for="mode in modes"
          :key="mode.id"
          class="shrink-0 w-32 h-40 rounded-2xl p-4 flex flex-col items-center justify-between border-2 border-b-4 transition-all active:border-b-2 active:translate-y-[2px]"
          :class="mode.color"
          @click="play(mode.id)"
        >
          <Icon :name="mode.icon" class="w-12 h-12" />
          <span class="font-bold uppercase text-sm">{{ mode.name }}</span>
        </button>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
const router = useRouter();
const { loadHighScore } = usePersistence();
const { soundEnabled, toggleSound, initAudio } = useAudio();
const highScore = ref(0);

onMounted(async () => {
  await initAudio();
  highScore.value = await loadHighScore("normal");
});

const play = (mode: string) => {
  router.push(`/play/${mode}`);
};

const modes = [
  {
    id: "reverse",
    name: "Reverse",
    icon: "heroicons:arrow-path-rounded-square",
    color: "bg-purple-100 border-purple-500 text-purple-600",
  },
  {
    id: "blitz",
    name: "Blitz",
    icon: "heroicons:bolt-solid",
    color: "bg-red-100 border-red-500 text-red-600",
  },
  {
    id: "hard",
    name: "Hard",
    icon: "heroicons:pencil-square-solid",
    color: "bg-blue-100 border-blue-500 text-blue-600",
  },
  {
    id: "capitals",
    name: "Capitals",
    icon: "heroicons:building-library-solid",
    color: "bg-yellow-100 border-yellow-500 text-yellow-600",
  },
  {
    id: "mindfuck",
    name: "Mindfuck",
    icon: "heroicons:sparkles-solid",
    color: "bg-pink-100 border-pink-500 text-pink-600",
  },
];
</script>
