<template>
  <button type="button" class="btn-base btn-md flex w-[85%] cursor-pointer items-center justify-center gap-2 self-center bg-primary text-white
    shadow-[0_8px_20px_rgba(168,63,98,0.22)] hover:bg-primary-hover hover:shadow-[0_8px_20px_rgba(176,71,105,0.25)] sm:w-auto sm:hover:scale-105"
    :disabled="disabled" @click="emit('click')">
    <!-- Play Icon -->
    <img src="@/assets/icons/play-hover-icon.svg" alt="" aria-hidden="true" width="20" height="20" class="h-5 w-5"/>
    <span>Play All</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  click: [];
}>();

</script>