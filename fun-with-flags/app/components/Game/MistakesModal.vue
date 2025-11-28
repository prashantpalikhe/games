<script setup lang="ts">
import { useGame } from '~/composables/game/useGame';

const { state } = useGame();
const isOpen = defineModel<boolean>('open');

const mistakes = computed(() => state.value.wrongAnswers);
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-black/50 transition-opacity duration-300 pointer-events-auto"
      @click="isOpen = false"
    ></div>

    <!-- Sheet -->
    <div 
      class="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl pointer-events-auto transform transition-transform duration-300 max-h-[80vh] flex flex-col"
    >
      <!-- Handle -->
      <div class="w-full flex justify-center pt-3 pb-1 sm:hidden">
        <div class="w-12 h-1.5 bg-gray-300 rounded-full"></div>
      </div>

      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 class="text-xl font-bold text-gray-800">Your Mistakes</h3>
        <button @click="isOpen = false" class="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500">
          <Icon name="lucide:x" class="w-5 h-5" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <div v-if="mistakes.length === 0" class="text-center text-gray-500 py-8">
          No mistakes yet! Great job!
        </div>

        <div v-for="(mistake, idx) in mistakes" :key="idx" class="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div class="flex items-start gap-4 mb-3">
            <img 
              :src="`https://flagcdn.com/w160/${mistake.question.correctOption.code}.png`" 
              class="w-16 h-auto rounded shadow-sm border border-gray-200"
            />
            <div>
              <div class="text-xs text-gray-400 font-bold uppercase mb-0.5">Correct Answer</div>
              <div class="font-bold text-gray-800">{{ mistake.question.correctOption.name }}</div>
            </div>
          </div>

          <div class="bg-red-50 rounded-lg p-3 flex items-center border border-red-100">
            <div class="bg-red-100 text-red-500 rounded-full p-1 mr-3">
              <Icon name="lucide:x" class="w-4 h-4" />
            </div>
            <div>
              <div class="text-[10px] text-red-400 font-bold uppercase mb-0.5">You Answered</div>
              <div class="text-sm font-bold text-red-600">
                <span v-if="mistake.type === 'timeout'">Time's Up!</span>
                <span v-else-if="typeof mistake.userAnswer === 'string'">"{{ mistake.userAnswer }}"</span>
                <span v-else-if="mistake.userAnswer">{{ mistake.userAnswer.name }}</span>
                <span v-else>Unknown</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-gray-100">
        <button 
          @click="isOpen = false"
          class="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

