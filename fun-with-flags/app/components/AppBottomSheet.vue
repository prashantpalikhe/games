<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
  title?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const close = () => {
  isOpen.value = false;
};
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="close"></div>

        <!-- Sheet -->
        <Transition
          enter-active-class="transition duration-300 cubic-bezier(0.4, 0, 0.2, 1)"
          enter-from-class="translate-y-full sm:scale-95 sm:opacity-0"
          enter-to-class="translate-y-0 sm:scale-100 sm:opacity-100"
          leave-active-class="transition duration-200 cubic-bezier(0.4, 0, 0.2, 1)"
          leave-from-class="translate-y-0 sm:scale-100 sm:opacity-100"
          leave-to-class="translate-y-full sm:scale-95 sm:opacity-0"
        >
          <div
            v-if="isOpen"
            class="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] flex flex-col"
          >
            <!-- Handle (Mobile only) -->
            <div class="w-full flex justify-center pt-3 pb-1 sm:hidden">
              <div class="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>

            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 class="text-xl font-bold text-gray-800">{{ title }}</h3>
              <button
                @click="close"
                class="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <Icon name="lucide:x" class="w-5 h-5" />
              </button>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto p-6">
              <slot></slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Custom cubic-bezier for that "native" feel */
.cubic-bezier {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>

