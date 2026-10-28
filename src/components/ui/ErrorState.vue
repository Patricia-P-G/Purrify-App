<template>
  <!-- Banner: red box above a list. Section: centered message inside a card. -->
  <div
    v-if="variant === 'banner'"
    class="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700"
    role="alert"
  >
    <p>{{ message }}</p>

    <button v-if="retryable" type="button" class="btn-base btn-sm mt-3 border border-primary bg-primary-pale text-primary hover:bg-primary-light"
      @click="emit('retry')">
      Try again
    </button>
  </div>

  <div v-else class="py-6 text-center" role="alert">
    <p class="text-sm text-text-secondary">{{ message }}</p>

    <button v-if="retryable" type="button" class="btn-base btn-sm mt-3 border border-primary bg-primary-pale text-primary hover:bg-primary-light"
      @click="emit('retry')">
      Try again
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    message: string;
    variant?: "section" | "banner";
    retryable?: boolean;
  }>(),
  { variant: "section", retryable: true },
);

const emit = defineEmits<{
  retry: [];
}>();
</script>
