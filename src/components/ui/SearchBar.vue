<template>
    <form role="search" class="relative w-full" @submit.prevent="emit('submit')">
      <!-- Search Icon -->
      <img src="@/assets/icons/magnifying-glass.svg" alt="" width="16" height="16" aria-hidden="true" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2
        opacity-40 sm:left-4"
      />

      <!-- Search Input -->
      <input :value="modelValue" type="search" :placeholder="placeholder" :aria-label="ariaLabel" autocomplete="off" class="w-full rounded-full border border-primary bg-surface py-2 pl-9 pr-10 text-sm text-primary-text outline-none transition-all duration-300 placeholder:text-text-muted focus:border-primary sm:py-2.5 sm:pl-10 sm:text-base motion-reduce:transition-none"
        @input="handleInput" @focus="emit('focus')"
      />

      <!-- Clear Button -->
      <button v-if="modelValue" type="button" aria-label="Clear search" class="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2
        cursor-pointer items-center justify-center rounded-full text-xl leading-none text-text-muted transition hover:text-primary
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none" @click="clearSearch">
          <img src="@/assets/icons/close.svg" alt="" aria-hidden="true" class="h-4 w-4" />
      </button>
  </form>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
    ariaLabel?: string;
  }>(),
  {
    placeholder: "Search...",
    ariaLabel: "Search",
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  submit: [];
  focus: [];
  clear: [];
}>();

// Updates the search value in the parent through v-model
const handleInput = (event: Event) => {
  emit("update:modelValue", (event.target as HTMLInputElement).value);
};

// Clears the current search value
const clearSearch = () => {
  emit("update:modelValue", "");
  emit("clear");
};
</script>

<style scoped>
/* Removes the browser's default clear button */
input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
  appearance: none;
  display: none;
}

input[type="search"]::-webkit-search-decoration {
  -webkit-appearance: none;
}

</style>