<template>
  <span class="pointer-events-none flex shrink-0 items-center justify-center rounded-full shadow-[0_4px_12px_rgba(75,75,85,0.16)] transition duration-200 motion-reduce:transform-none motion-reduce:transition-none"
    :class="[active ? 'bg-primary' : 'bg-primary-light group-hover:scale-105', sizeClass]" aria-hidden="true">
    <!-- Playing -->
    <span v-if="active && playing" class="flex items-center justify-center">
      <img src="@/assets/icons/vertical-lines.svg" alt="" :class="iconClass" />
    </span>

    <!-- Selected but Paused -->
    <img v-else-if="active" src="@/assets/icons/play-hover-icon.svg" alt="" :class="iconClass"/>

    <!-- Normal Play -->
    <img v-else src="@/assets/icons/play-icon.svg" alt="" :class="iconClass"/>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{
  active: boolean;
  playing: boolean;
  size?: "sm" | "md" | "lg";
}>(), {
  size: "sm",
});

const sizeClass = computed(() => {
  if (props.size === "lg") return "h-16 w-16";
  if (props.size === "md") return "h-12 w-12";

  return "h-10 w-10";
});

const iconClass = computed(() => {
  if (props.size === "lg") return "h-8 w-8";
  if (props.size === "md") return "h-7 w-7";

  return "h-5 w-5";
});

</script>