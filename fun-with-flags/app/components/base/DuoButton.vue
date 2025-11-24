<template>
    <button
      class="
        relative w-full rounded-2xl border-2 border-b-4 font-bold transition-all 
        flex items-center justify-center select-none active:border-b-2 active:translate-y-[2px]
        disabled:opacity-50 disabled:active:border-b-4 disabled:active:translate-y-0 disabled:cursor-not-allowed
        focus:outline-none
      "
      :class="[colorClasses, sizeClasses]"
      v-bind="$attrs"
    >
      <slot />
    </button>
  </template>
  
  <script setup lang="ts">
  const props = defineProps({
    color: {
      type: String as PropType<'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'white'>,
      default: 'white'
    },
    size: {
      type: String as PropType<'sm' | 'md' | 'lg' | 'xl'>,
      default: 'md'
    }
  })
  
  const colorClasses = computed(() => {
    const map: Record<string, string> = {
      white: 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 active:border-gray-200',
      blue: 'bg-duo-blue border-duo-blue-dark text-white hover:bg-[#3dd2ff] active:border-duo-blue-dark',
      green: 'bg-duo-green border-duo-green-dark text-white hover:bg-[#61e002] active:border-duo-green-dark',
      red: 'bg-duo-red border-duo-red-dark text-white hover:bg-[#ff5e5e] active:border-duo-red-dark',
      yellow: 'bg-duo-yellow border-duo-yellow-dark text-yellow-900 hover:bg-[#ffda00] active:border-duo-yellow-dark',
      gray: 'bg-duo-gray border-duo-gray-dark text-gray-500 active:border-duo-gray-dark'
    }
    return map[props.color]
  })
  
  const sizeClasses = computed(() => {
    return props.size === 'xl' ? 'py-4 px-6 text-xl' : 'py-3 px-4 text-lg'
  })
  </script>