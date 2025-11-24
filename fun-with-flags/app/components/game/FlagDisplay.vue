<template>
  <div
    class="w-full aspect-video relative flex items-center justify-center overflow-hidden rounded-xl bg-gray-100 border-2 border-gray-100"
    :class="sizeClass"
  >
    <Icon v-if="!useEmoji && iconName" :name="iconName" class="w-full h-full object-cover" mode="svg" />

    <span v-else class="leading-none select-none" :style="{ fontSize: emojiSize }">
      {{ emoji }}
    </span>

    <div v-if="effect" :class="effect" class="absolute inset-0 pointer-events-none mix-blend-overlay"></div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  code: { type: String, required: true },
  useEmoji: { type: Boolean, default: false },
  effect: { type: String, default: null },
  size: { type: String, default: "md" },
});

const iconName = computed(() => (props.code ? `flag:${props.code.toLowerCase()}-4x3` : ""));

const emoji = computed(() => {
  return props.code.toUpperCase().replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
});

const sizeClass = computed(
  () =>
    ({
      "h-24 w-32": props.size === "sm",
      "h-40 w-56": props.size === "md",
      "h-52 w-72": props.size === "lg",
    }[props.size])
);

const emojiSize = computed(
  () =>
    ({
      sm: "4rem",
      md: "6rem",
      lg: "8rem",
    }[props.size])
);
</script>

<style scoped>
.mf-invert {
  filter: invert(1);
}
.mf-grayscale {
  filter: grayscale(1);
}
.mf-blur {
  filter: blur(4px);
}
.mf-flip-v {
  transform: scaleY(-1);
}
.mf-flip-h {
  transform: scaleX(-1);
}
</style>
