<template>
  <RouterLink :to="to" :aria-label="`See all ${name}`" class="rounded-full border border-primary bg-primary-pale px-3 py-1.5 text-sm font-semibold
   text-primary transition duration-200 hover:scale-105 hover:bg-primary-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
   active:scale-95 motion-reduce:transform-none motion-reduce:transition-none">
    See all
  </RouterLink>
</template>

<script setup lang="ts">
defineProps<{
  to: string;
  name: string;
}>();

</script>