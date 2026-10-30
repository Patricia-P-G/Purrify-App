<template>
  <!-- Full-page loading state, shown in a white card -->
  <div class="flex min-h-125 items-center justify-center rounded-[22px] border border-border bg-surface px-4
   shadow-[0_14px_40px_rgba(75,75,85,0.12)] sm:rounded-[28px]">
    <div class="text-center" role="status" aria-live="polite">
      <div class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary-light border-t-primary
       motion-reduce:animate-none" aria-hidden="true"></div>

      <p class="mt-4 text-sm text-text-muted">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string;
}>();
</script>