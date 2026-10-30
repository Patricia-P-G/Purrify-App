<template>
  <div ref="triggerElement" class="flex h-20 items-center justify-center gap-3">
    <template v-if="loading">
      <div class="h-5 w-5 animate-spin rounded-full border-2 border-primary-light border-t-primary motion-reduce:animate-none" aria-hidden="true"></div>

      <span class="text-sm text-text-secondary" role="status">
        Loading more songs...
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  loading: boolean;
}>();

const triggerElement = ref<HTMLElement | null>(null);

defineExpose({
  triggerElement,
});

</script>