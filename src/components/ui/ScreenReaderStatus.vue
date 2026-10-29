<template>
  <!-- Invisible message that screen readers announce when it changes -->
  <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
    {{ message }}
  </p>
</template>

<script setup lang="ts">
defineProps<{
  message: string;
}>();
</script>
