<script setup lang="ts">
import { useGameStorage } from '~/composables/game/useGameStorage';

const isOpen = defineModel<boolean>('open');
const storage = useGameStorage();
// We need reactive settings. `storage.getSettings()` returns a snapshot.
// Ideally, we should wrap settings in a composable or just ref it here and save on change.
// For simplicity, we'll read on mount/open and save on change.

const soundEnabled = ref(true);

// Sync with storage when sheet opens
watch(isOpen, (val) => {
  if (val) {
    const s = storage.getSettings();
    soundEnabled.value = s.soundEnabled;
  }
});

// Save on toggle
watch(soundEnabled, (val) => {
  const s = storage.getSettings();
  storage.saveSettings({ ...s, soundEnabled: val });
  // You might want to trigger a re-read in other components if they don't use a shared reactive state for settings
  // For now, this persists it.
});

const toggleSound = () => {
  soundEnabled.value = !soundEnabled.value;
};
</script>

<template>
  <AppBottomSheet v-model="isOpen" title="Settings">
    <div class="flex flex-col space-y-4">
      <!-- Sound Toggle -->
      <button
        @click="toggleSound"
        class="py-4 px-4 rounded-xl font-bold text-left transition-all flex justify-between items-center border-2"
        :class="soundEnabled ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-600'"
      >
        <div class="flex items-center space-x-3">
          <Icon :name="soundEnabled ? 'lucide:volume-2' : 'lucide:volume-x'" class="w-6 h-6" />
          <span>Sound Effects</span>
        </div>
        
        <div
          class="w-12 h-6 rounded-full relative transition-colors duration-200"
          :class="soundEnabled ? 'bg-blue-500' : 'bg-gray-300'"
        >
          <div
            class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200"
            :class="soundEnabled ? 'translate-x-6' : 'translate-x-0'"
          ></div>
        </div>
      </button>

      <!-- Region Selector (Future) -->
      <div class="p-4 rounded-xl border-2 border-gray-100 bg-gray-50 text-gray-400 text-center text-sm">
        Region selection coming soon...
      </div>
    </div>
  </AppBottomSheet>
</template>

