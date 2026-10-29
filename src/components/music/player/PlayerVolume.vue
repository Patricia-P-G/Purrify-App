<template>
  <div class="flex items-center gap-2">
    <button type="button" :aria-label="volume === 0 ? 'Unmute' : 'Mute'" :aria-pressed="volume === 0"
     class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-primary transition hover:bg-primary-light
     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95
     motion-reduce:transform-none motion-reduce:transition-none" @click="toggleMute">
      <img v-if="volume === 0" src="@/assets/icons/volume-mute.svg" alt="" class="h-5 w-5" aria-hidden="true"/>
      <img v-else src="@/assets/icons/volume.svg" alt="" class="h-5 w-5" aria-hidden="true"/>
    </button>

    <input v-model.number="volume" type="range" min="0" max="100" step="1" aria-label="Volume"
     class="volume-slider w-24 cursor-pointer" :style="{ '--volume-progress': `${volume}%` }" @input="changeVolume"/>
  </div>
</template>

<script setup lang="ts">
import { usePlayerVolume } from "@/composables/usePlayerVolume";

const { volume, changeVolume, toggleMute } = usePlayerVolume();
</script>

<style scoped>
.volume-slider {
  height: 5px;
  appearance: none;
  border-radius: 9999px;
  background: linear-gradient(
    to right,
    var(--color-primary) 0%,
    var(--color-primary) var(--volume-progress),
    var(--color-primary-light) var(--volume-progress),
    var(--color-primary-light) 100%
  );
  outline: none;
}

.volume-slider:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 4px;
}

.volume-slider::-webkit-slider-thumb {
  width: 14px;
  height: 14px;
  appearance: none;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
}

.volume-slider::-moz-range-track {
  height: 5px;
  border-radius: 9999px;
  background: var(--color-primary-light);
}

.volume-slider::-moz-range-progress {
  height: 5px;
  border-radius: 9999px;
  background: var(--color-primary);
}

.volume-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border: none;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
}

</style>