<template>
  <NuxtLayout name="game">
    <div class="flex flex-col h-full relative" :class="{ 'animate-shake': shakeTrigger }">
      <FloatingPoints ref="floatingPointsRef" />

      <div class="px-4 py-4 flex flex-col bg-white border-b-2 border-gray-100 z-10 mt-safe">
        <div class="flex items-center justify-between w-full">
          <button class="text-gray-400 hover:text-gray-600 transition-transform active:scale-90 size-8" @click="quit">
            <Icon name="heroicons:x-mark-solid" class="size-8" />
          </button>

          <div class="flex-1 mx-4 h-4 bg-gray-200 rounded-full overflow-hidden relative">
            <div
              class="absolute top-0 left-0 h-full bg-duo-green transition-all duration-500"
              :style="{ width: `${progress}%` }"
            >
              <div class="absolute top-1 right-2 w-2/3 h-1 bg-white/30 rounded-full"></div>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <Icon name="heroicons:heart-solid" class="w-8 h-8 text-duo-red animate-pulse" />
            <span class="text-xl font-black text-duo-red">{{ state.lives }}</span>
          </div>
        </div>

        <div v-if="mode === 'blitz'" class="w-full mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full transition-all duration-100 linear"
            :class="state.timer! < 2 ? 'bg-duo-red' : 'bg-duo-yellow'"
            :style="{ width: `${(state.timer! / 5) * 100}%` }"
          ></div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4 pb-32 flex flex-col items-center w-full animate-fade-in">
        <div v-if="currentQuestion" class="w-full max-w-sm">
          <h2 class="text-2xl font-bold text-gray-700 my-6 text-left">
            {{ getQuestionText(currentQuestion.type) }}
          </h2>

          <div v-if="currentQuestion.type === 'identify' || currentQuestion.type === 'capitals'" class="w-full">
            <div class="mb-10 flex justify-center">
              <FlagDisplay :code="currentQuestion.correctItem.id" size="lg" />
            </div>

            <div class="grid gap-3 w-full">
              <DuoButton
                v-for="(option, idx) in currentQuestion.options"
                :key="option.id"
                :color="getOptionColor(option)"
                class="group justify-start"
                :disabled="isAnswered"
                @click="handleAnswer(option, $event)"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-lg border-2 border-gray-200 flex items-center justify-center text-gray-400 text-sm font-bold group-hover:bg-gray-50 group-hover:text-gray-600"
                  >
                    {{ idx + 1 }}
                  </div>
                  <span>
                    {{ currentQuestion.type === "capitals" ? option.metadata?.capital : option.name }}
                  </span>
                </div>
              </DuoButton>
            </div>
          </div>

          <div v-else-if="currentQuestion.type === 'reverse'" class="w-full">
            <div class="mb-8 p-6 bg-white rounded-2xl border-2 border-gray-200 text-center shadow-sm">
              <h3 class="text-3xl font-black text-duo-text">
                {{ currentQuestion.correctItem.name }}
              </h3>
            </div>

            <div class="grid grid-cols-2 gap-4 w-full">
              <DuoButton
                v-for="option in currentQuestion.options"
                :key="option.id"
                :color="getOptionColor(option)"
                class="h-32 flex-col gap-2 p-2"
                @click="handleAnswer(option, $event)"
                :disabled="isAnswered"
              >
                <FlagDisplay :code="option.id" size="lg" class="pointer-events-none" :effect="currentQuestion.effect" />
              </DuoButton>
            </div>
          </div>

          <div v-else-if="currentQuestion.type === 'input'" class="w-full">
            <div class="mb-10 flex justify-center animate-float-up">
              <FlagDisplay
                :code="currentQuestion.correctItem.id"
                size="lg"
                class="shadow-xl"
                :effect="currentQuestion.effect"
              />
            </div>

            <form class="w-full space-y-4" @submit.prevent="handleHardSubmit">
              <input
                v-model="hardInput"
                type="text"
                placeholder="Type country name..."
                class="w-full p-4 rounded-2xl border-2 border-gray-300 text-xl font-bold text-center focus:outline-none focus:border-duo-blue focus:ring-4 focus:ring-duo-blue/20 transition-all uppercase placeholder:normal-case placeholder:font-normal"
                :class="{
                  'border-duo-green bg-green-50 text-duo-green-dark': isAnswered && isCorrect,
                  'border-duo-red bg-red-50 text-duo-red-dark': isAnswered && !isCorrect,
                }"
                :disabled="isAnswered"
                autofocus
              />
              <DuoButton type="submit" color="blue" size="xl" :disabled="!hardInput || isAnswered"> CHECK </DuoButton>
            </form>
          </div>
        </div>
      </div>

      <div
        class="fixed will-change-transform bottom-0 left-0 right-0 p-4 pt-6 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-out z-50 max-w-md mx-auto border-t-2 bg-white"
        :class="feedbackClass"
        :style="{
          transform: isAnswered ? 'translateY(0)' : 'translateY(100%)',
        }"
      >
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Icon
                :name="isCorrect ? 'heroicons:check-solid' : 'heroicons:x-mark-solid'"
                class="w-6 h-6"
                :class="isCorrect ? 'text-duo-green' : 'text-duo-red'"
              />
            </div>
            <div class="flex flex-col">
              <span class="text-2xl font-black" :class="isCorrect ? 'text-duo-green-dark' : 'text-duo-red-dark'">
                {{ isCorrect ? "Excellent!" : userAnsweredString === "TIMEOUT" ? "Time's Up!" : "Incorrect" }}
              </span>
              <span v-if="!isCorrect" class="text-duo-red text-sm font-bold">
                Correct: {{ currentQuestion?.correctItem.name }}
              </span>
            </div>
          </div>
        </div>

        <DuoButton :color="isCorrect ? 'green' : 'red'" size="xl" @click="next"> CONTINUE </DuoButton>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { GameItem, GameMode } from "~/types/game";
import FloatingPoints from "~/components/game/FloatingPoints.vue";
import { COUNTRIES } from "~/utils/game-data";

const route = useRoute();
const router = useRouter();
const mode = route.params.mode as GameMode;

const { state, currentQuestion, initGame, submitAnswer, nextQuestion } = useGameEngine();

const floatingPointsRef = ref();
const isAnswered = ref(false);
const isCorrect = ref(false);
const selectedId = ref<string | null>(null);
const hardInput = ref("");
const shakeTrigger = ref(false);
const userAnsweredString = ref("");

onMounted(() => {
  initGame(mode);
});

const progress = computed(() => {
  const total = COUNTRIES.length;
  const current = state.value.history.length;
  return Math.min((current / total) * 100, 100);
});

const getQuestionText = (type: string) => {
  const map: Record<string, string> = {
    identify: "Which country is this?",
    reverse: "Select the correct flag",
    capitals: "What is the capital city?",
    input: "Type the country name",
  };
  return map[type] || "Answer the question";
};

const handleAnswer = (option: GameItem, event?: MouseEvent) => {
  if (isAnswered.value) return;

  selectedId.value = option.id;
  const result = submitAnswer(option, mode);
  processResult(result, event);
};

const handleHardSubmit = (event?: Event) => {
  if (isAnswered.value) return;

  // Check match manually for UI feedback before submitting if needed, or let engine handle it
  // We let engine handle it to keep logic centralized
  const result = submitAnswer(hardInput.value, mode);
  processResult(result, null);
};

const processResult = (result: boolean | null, event: MouseEvent | null | undefined) => {
  if (result === null) {
    // Timeout handling via watch or callback usually, but here we might get null if status not playing
    userAnsweredString.value = "TIMEOUT";
    isCorrect.value = false;
    isAnswered.value = true;
    return;
  }

  isCorrect.value = result;
  isAnswered.value = true;

  if (isCorrect.value) {
    const points = 10 + state.value.streak * 2;
    if (event) {
      floatingPointsRef.value?.add(event.clientX, event.clientY, points);
    } else {
      floatingPointsRef.value?.add(window.innerWidth / 2, window.innerHeight / 2, points);
    }
  } else {
    shakeTrigger.value = true;
    setTimeout(() => (shakeTrigger.value = false), 500);
  }
};

const next = () => {
  if (state.value.status === "game-over") {
    router.push("/results");
    return;
  }

  isAnswered.value = false;
  nextQuestion(mode);

  hardInput.value = "";
  userAnsweredString.value = "";
  selectedId.value = null;

  setTimeout(() => {
    isCorrect.value = false;
  }, 300);
};

const quit = () => {
  router.push("/");
};

const getOptionColor = (option: GameItem) => {
  if (!isAnswered.value) return "white";

  if (selectedId.value === option.id) {
    return isCorrect.value ? "green" : "red";
  }

  if (!isCorrect.value && option.id === currentQuestion.value?.correctItem.id) {
    return "green";
  }

  return "white";
};

const feedbackClass = computed(() => {
  return isCorrect.value
    ? "bg-duo-green-light/10 border-duo-green-light text-duo-green-dark"
    : "bg-duo-red/10 border-duo-red text-duo-red-dark";
});
</script>
