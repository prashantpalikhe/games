<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useGame } from "~/composables/game/useGame";
import type { Country } from "~/types/game";

const { state, submitAnswer, continueGame } = useGame();

const question = computed(() => state.value.currentQuestion);
const isFeedback = computed(() => state.value.feedback !== null);
const isCorrect = computed(() => state.value.feedback === "correct");
const isTimeout = computed(() => state.value.feedback === "timeout");
const userAnswer = ref("");
const selectedOptionCode = ref<string | null>(null);

watch(question, () => {
  userAnswer.value = "";
  selectedOptionCode.value = null;
});

const prompt = computed(() => {
  if (!question.value) return "";
  if (state.value.mode === "hard") return "Type the country name";
  switch (question.value.type) {
    case "reverse":
      return "Which flag belongs to this country?";
    case "capital":
      return "What is the capital?";
    case "description":
      return "Which country matches this description?";
    default:
      return "Which country is this?";
  }
});

const showFlagImage = computed(() => {
  if (!question.value) return false;
  return question.value.type !== "reverse" && question.value.type !== "description";
});

const showDescription = computed(() => question.value?.type === "description");

const lastWrongAnswer = computed(() => {
  if (state.value.feedback !== "incorrect") return null;
  return state.value.wrongAnswers[state.value.wrongAnswers.length - 1] ?? null;
});

const wrongOptionCode = computed(() => {
  const wrong = lastWrongAnswer.value;
  if (!wrong || typeof wrong.userAnswer === "string" || !wrong.userAnswer) return null;
  return wrong.userAnswer.code;
});

const handleOptionClick = (option: Country) => {
  if (isFeedback.value) return;
  selectedOptionCode.value = option.code;
  submitAnswer(option);
};

const handleHardSubmit = () => {
  const value = userAnswer.value.trim();
  if (!value || isFeedback.value) return;
  submitAnswer(value);
};

const getOptionLabel = (option: Country) => {
  if (question.value?.type === "capital") {
    return option.capital || option.name;
  }
  return option.name;
};

const getOptionClass = (option: Country) => {
  const base =
    "relative w-full rounded-2xl border-2 font-bold transition-all flex items-center justify-between group no-select bg-white";

  if (isFeedback.value) {
    if (option.code === question.value?.correctOption.code) {
      return `${base} bg-green-100 border-green-500 text-green-700`;
    }
    if (wrongOptionCode.value === option.code) {
      return `${base} bg-red-100 border-red-500 text-red-700`;
    }
    return `${base} border-gray-200 opacity-50 text-gray-400`;
  }

  if (selectedOptionCode.value === option.code) {
    return `${base} border-blue-500 text-blue-700 bg-blue-50`;
  }

  return `${base} border-gray-200 hover:bg-gray-50 text-gray-700 active:border-b-2 active:translate-y-[2px] border-b-4`;
};

const correctAnswerText = computed(() => {
  if (!question.value) return "";
  if (question.value.type === "capital") {
    return question.value.correctOption.capital;
  }
  return question.value.correctOption.name;
});

const handleContinue = () => {
  continueGame();
};
</script>

<template>
  <div class="flex-1 overflow-y-auto p-4 flex flex-col items-center w-full max-w-md mx-auto pb-36">
    <h2 class="text-2xl font-bold text-gray-700 mt-4 mb-6 text-left w-full">
      {{ prompt }}
    </h2>

    <div
      v-if="question"
      class="mb-8 p-4 bg-white rounded-2xl shadow-sm border-2 border-gray-100 w-full flex flex-col items-center min-h-[200px]"
    >
      <img
        v-if="showFlagImage"
        :src="`https://flagcdn.com/w640/${question.correctOption.code}.png`"
        alt="Flag"
        class="h-48 w-auto rounded-lg shadow-md object-cover border border-gray-200"
      />

      <h3 v-else-if="question.type === 'reverse'" class="text-3xl font-extrabold text-gray-800 text-center mt-4">
        {{ question.correctOption.name }}
      </h3>

      <div v-else-if="showDescription" class="text-center space-y-2">
        <div class="text-xl font-bold text-gray-600">📖 Flag Description:</div>
        <p class="text-lg text-gray-800 leading-relaxed">
          {{ question.correctOption.description }}
        </p>
      </div>
    </div>

    <form v-if="state.mode === 'hard' && question" @submit.prevent="handleHardSubmit" class="w-full space-y-4">
      <input
        v-model="userAnswer"
        type="text"
        placeholder="Type country name..."
        class="w-full p-4 rounded-xl border-2 border-gray-200 text-lg font-bold text-center focus:outline-none focus:border-blue-500 transition-colors"
        :disabled="isFeedback"
      />
      <button
        type="submit"
        class="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-md active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isFeedback || !userAnswer.trim()"
      >
        Submit Answer
      </button>
    </form>

    <div
      v-else-if="question"
      class="grid w-full"
      :class="question.type === 'reverse' ? 'grid-cols-2 gap-4' : 'grid-cols-1 gap-3'"
    >
      <button
        v-for="(option, idx) in question.options"
        :key="option.code"
        :class="getOptionClass(option)"
        :disabled="isFeedback"
        @click="handleOptionClick(option)"
      >
        <div v-if="question.type === 'reverse'" class="flex flex-col items-center w-full">
          <img
            :src="`https://flagcdn.com/w320/${option.code}.png`"
            class="h-20 w-auto rounded shadow-sm object-cover mb-2"
            alt="Flag"
          />
          <span class="text-sm text-gray-600 font-semibold">{{ option.name }}</span>
        </div>
        <div v-else class="flex items-center">
          <span
            class="flex items-center justify-center w-8 h-8 rounded-lg text-sm border border-gray-200 mr-3 bg-gray-50 text-gray-500 font-medium"
          >
            {{ idx + 1 }}
          </span>
          <span class="text-lg">{{ getOptionLabel(option) }}</span>
        </div>
      </button>
    </div>

    <div
      v-if="isFeedback"
      class="fixed bottom-0 left-0 right-0 max-w-md mx-auto sheet-transition p-4 border-t-2 flex flex-col z-40 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] bg-white"
      :class="isCorrect ? 'border-green-200' : 'border-red-200'"
    >
      <div class="flex items-center justify-between mb-4 px-2">
        <div class="flex items-center space-x-3">
          <div class="p-2 rounded-full text-white" :class="isCorrect ? 'bg-green-500' : 'bg-red-500'">
            <Icon :name="isCorrect ? 'lucide:check' : 'lucide:x'" />
          </div>
          <div>
            <h3 class="text-xl font-extrabold" :class="isCorrect ? 'text-green-600' : 'text-red-600'">
              {{ isCorrect ? "Excellent!" : isTimeout ? "Time's Up!" : "Incorrect" }}
            </h3>
            <p v-if="!isCorrect || isTimeout" class="text-sm text-gray-500 font-medium">
              Correct: {{ correctAnswerText }}
            </p>
          </div>
        </div>
      </div>
      <button
        @click="handleContinue"
        class="w-full py-3 px-6 rounded-xl font-bold text-white text-lg uppercase tracking-wider border-b-4 active:border-b-0 active:translate-y-1 transition-all shadow-md no-select"
        :class="
          isCorrect ? 'bg-green-500 hover:bg-green-600 border-green-700' : 'bg-red-500 hover:bg-red-600 border-red-700'
        "
      >
        Continue
      </button>
      <div class="h-2"></div>
    </div>
  </div>
</template>
