<script setup lang="ts">
import { useGame } from '~/composables/game/useGame';
import type { Country } from '~/types/game';

const { state, submitAnswer } = useGame();

const question = computed(() => state.value.currentQuestion);
const isFeedback = computed(() => state.value.feedback !== null);

// Option styling based on state
const getOptionClass = (option: Country) => {
  const base = "relative w-full p-4 rounded-2xl border-2 font-bold transition-all flex items-center justify-between group no-select bg-white";
  
  if (isFeedback.value) {
    if (option.code === question.value?.correctOption.code) {
      return `${base} bg-green-100 border-green-500 text-green-700`;
    }
    // Highlight the wrong answer selected by user
    const wrongAnswer = state.value.wrongAnswers[state.value.wrongAnswers.length - 1];
    if (wrongAnswer?.userAnswer === option) { // Note: Equality check might need ID if object ref changes
       return `${base} bg-red-100 border-red-500 text-red-700`;
    }
    return `${base} border-gray-200 opacity-50 text-gray-400`;
  }

  return `${base} border-gray-200 hover:bg-gray-50 text-gray-700 active:border-b-2 active:translate-y-[2px] border-b-4`;
};

const handleOptionClick = (option: Country) => {
  submitAnswer(option);
};
</script>

<template>
  <div class="flex-1 overflow-y-auto p-4 flex flex-col items-center w-full max-w-md mx-auto pb-32">
    <h2 class="text-2xl font-bold text-gray-700 mt-4 mb-6 text-left w-full">
      Which country is this?
    </h2>

    <!-- Question Image (Flag) -->
    <div v-if="question" class="mb-8 p-4 bg-white rounded-2xl shadow-sm border-2 border-gray-100 w-full flex justify-center items-center min-h-[200px]">
      <img
        :src="`https://flagcdn.com/w640/${question.correctOption.code}.png`"
        :alt="state.mode === 'hard' ? 'Guess the country' : 'Flag'"
        class="h-48 w-auto rounded-lg shadow-md object-cover border border-gray-200"
      />
    </div>

    <!-- Options Grid -->
    <div v-if="question" class="grid w-full gap-3 grid-cols-1">
      <button
        v-for="(option, idx) in question.options"
        :key="option.code"
        @click="handleOptionClick(option)"
        :disabled="isFeedback"
        :class="getOptionClass(option)"
      >
        <div class="flex items-center">
          <span class="flex items-center justify-center w-8 h-8 rounded-lg text-sm border border-gray-200 mr-3 bg-gray-50 text-gray-500 font-medium">
            {{ idx + 1 }}
          </span>
          <span class="text-lg">{{ option.name }}</span>
        </div>
      </button>
    </div>
  </div>
</template>

