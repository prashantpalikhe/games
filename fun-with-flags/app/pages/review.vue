<template>
    <NuxtLayout name="game">
      <div class="flex flex-col h-full bg-gray-50">
        <div class="bg-white px-4 py-4 border-b-2 border-gray-100 mt-safe flex items-center gap-3">
          <button @click="router.back()" class="text-gray-400 hover:text-gray-600">
            <Icon name="heroicons:arrow-left-solid" class="w-6 h-6" />
          </button>
          <h1 class="text-xl font-black text-gray-700">Review Mistakes</h1>
        </div>
  
        <div class="flex-1 overflow-y-auto p-4 space-y-4 pb-safe">
          <div 
            v-for="(item, idx) in mistakes" 
            :key="idx"
            class="bg-white rounded-2xl p-4 border-2 border-gray-100 shadow-sm"
          >
            <div class="flex items-start gap-4 mb-3">
              <FlagDisplay 
                :code="item.itemId" 
                size="sm" 
                class="shrink-0 border border-gray-200"
              />
              <div>
                <div class="text-xs font-bold text-gray-400 uppercase mb-1">Correct Answer</div>
                <div class="text-lg font-black text-gray-800 leading-tight">
                  {{ getCorrectName(item) }}
                </div>
              </div>
            </div>
  
            <div class="bg-red-50 rounded-xl p-3 flex items-center gap-3 border border-red-100">
              <Icon name="heroicons:x-mark-solid" class="w-5 h-5 text-duo-red" />
              <div>
                <div class="text-[10px] font-bold text-red-400 uppercase">You Answered</div>
                <div class="font-bold text-duo-red leading-tight">
                  {{ item.userAnswer || 'Time up / Skipped' }}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="p-4 bg-white border-t-2 border-gray-100">
          <DuoButton color="gray" @click="router.push('/')">HOME</DuoButton>
        </div>
      </div>
    </NuxtLayout>
  </template>
  
  <script setup lang="ts">
  const { state } = useGameEngine()
  const router = useRouter()
  
  const mistakes = computed(() => state.value.history.filter(h => !h.correct))
  
  const getCorrectName = (item: any) => {
    return item._rawCorrect?.name || item.correctAnswer
  }
  </script>