<template>
  <div class="flex min-w-0 items-center overflow-hidden whitespace-nowrap">
    <template v-for="(artist, index) in artists" :key="`${artist.name}-${index}`">
      <span v-if="index > 0" class="mr-1">,</span>
      <RouterLink v-if="artist.id" :to="{ name: 'artist', params: { id: artist.id } }"
       class="shrink-0 hover:underline hover:underline-offset-2 focus-visible:rounded-sm
       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
       @click="emit('navigate')">
        {{ artist.name }}
      </RouterLink>
      <span v-else class="shrink-0">{{ artist.name }}</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { TrackArtist } from "@/utils/trackArtists";

defineProps<{
  artists: TrackArtist[];
}>();

const emit = defineEmits<{
  navigate: [];
}>();

</script>