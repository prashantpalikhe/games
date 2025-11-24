<template>
  <div
    class="min-h-screen bg-gray-100 flex items-center justify-center p-0 md:p-4 font-display text-duo-text"
  >
    <div
      class="w-full max-w-md h-screen md:h-[90vh] md:max-h-[900px] bg-white md:rounded-3xl shadow-2xl relative overflow-hidden flex flex-col"
    >
      <slot />
    </div>
  </div>
</template>
