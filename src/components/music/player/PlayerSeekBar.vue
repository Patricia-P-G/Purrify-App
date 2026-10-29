<template>
  <div class="relative w-full cursor-pointer rounded-full bg-primary-light focus-visible:outline-2
   focus-visible:outline-offset-4 focus-visible:outline-primary" :class="large ? 'h-2' : 'h-1.5'"
   role="slider" tabindex="0" aria-label="Song progress"
   :aria-valuemin="0" :aria-valuemax="duration" :aria-valuenow="position"
   :aria-valuetext="`${formattedPosition} of ${formattedDuration}`"
   @click="seekToClick" @keydown.left.prevent="seekBy(-5000)" @keydown.right.prevent="seekBy(5000)">
    <div class="h-full rounded-full bg-primary" :style="{ width: `${progressPercentage}%` }"></div>
    <span v-if="large" class="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-sm"
     :style="{ left: `${progressPercentage}%` }" aria-hidden="true"></span>
  </div>
</template>

<script setup lang="ts">
import { usePlayerProgress } from "@/composables/usePlayerProgress";

defineProps<{
  large?: boolean;
}>();

const { position, duration, progressPercentage, formattedPosition, formattedDuration, seekToClick, seekBy } = usePlayerProgress();

</script>
