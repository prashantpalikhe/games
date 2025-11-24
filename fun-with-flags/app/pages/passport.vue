<template>
    <NuxtLayout name="game">
      <div class="flex flex-col h-full bg-gray-50">
        <div class="bg-white px-4 py-4 border-b-2 border-gray-100 mt-safe flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button @click="router.push('/')" class="text-gray-400 hover:text-gray-600">
              <Icon name="heroicons:arrow-left-solid" class="w-6 h-6" />
            </button>
            <h1 class="text-xl font-black text-gray-700">Passport</h1>
          </div>
          <div class="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-bold">
            {{ collectedCount }} / {{ totalCount }}
          </div>
        </div>
  
        <div class="flex-1 overflow-y-auto p-4 pb-safe">
          <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
            <div 
              v-for="country in COUNTRIES" 
              :key="country.id"
              class="aspect-square rounded-2xl flex items-center justify-center relative overflow-hidden border-2 transition-all"
              :class="hasCollected(country.id) ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-200 border-gray-200 opacity-50'"
            >
              <FlagDisplay 
                v-if="hasCollected(country.id)" 
                :code="country.id" 
                size="md" 
                class="w-full h-full !rounded-none"
              />
              <span v-else class="text-2xl text-gray-400 font-black">?</span>
              
              <div v-if="getCollectionCount(country.id) > 1" class="absolute bottom-0 right-0 bg-duo-blue text-white text-[10px] font-bold px-1.5 py-0.5 rounded-tl-lg">
                {{ getCollectionCount(country.id) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </NuxtLayout>
  </template>
  
  <script setup lang="ts">
  import { COUNTRIES } from '~/utils/game-data'
  
  const router = useRouter()
  const { loadCollection } = usePersistence()
  const collection = ref<Record<string, number>>({})
  
  onMounted(async () => {
    collection.value = await loadCollection()
  })
  
  const totalCount = COUNTRIES.length
  const collectedCount = computed(() => Object.keys(collection.value).length)
  
  const hasCollected = (id: string) => !!collection.value[id]
  const getCollectionCount = (id: string) => collection.value[id] || 0
  </script>