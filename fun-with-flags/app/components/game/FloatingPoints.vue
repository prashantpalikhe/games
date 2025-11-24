<template>
    <div class="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      <TransitionGroup name="float">
        <div
          v-for="point in points"
          :key="point.id"
          class="absolute text-4xl font-black text-duo-yellow drop-shadow-md"
          :style="{ left: `${point.x}px`, top: `${point.y}px` }"
          style="-webkit-text-stroke: 2px #e5a500;"
        >
          +{{ point.amount }}
        </div>
      </TransitionGroup>
    </div>
  </template>
  
  <script setup lang="ts">
  interface Point {
    id: number
    x: number
    y: number
    amount: number
  }
  
  const points = ref<Point[]>([])
  let counter = 0
  
  const add = (x: number, y: number, amount: number) => {
    const id = counter++
    points.value.push({ id, x, y, amount })
    setTimeout(() => {
      points.value = points.value.filter(p => p.id !== id)
    }, 800)
  }
  
  defineExpose({ add })
  </script>
  
  <style scoped>
  .float-enter-active {
    animation: float-up 0.8s ease-out forwards;
  }
  .float-leave-active {
    transition: opacity 0.3s;
  }
  .float-enter-from,
  .float-leave-to {
    opacity: 0;
  }
  
  @keyframes float-up {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-60px) scale(1.2); opacity: 0; }
  }
  </style>