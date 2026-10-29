<template>
  <section class="fixed bottom-16 left-0 right-0 z-40 border-t border-primary-light bg-background/95 px-3 py-2.5
   shadow-[0_-8px_30px_rgba(75,75,85,0.12)] backdrop-blur-md md:bottom-0 md:left-24 md:px-5 lg:hidden"
   aria-label="Music player">
    <div class="flex min-w-0 items-end gap-3">
      <div class="flex min-w-0 flex-1 items-center gap-3">
        <button type="button" class="shrink-0 cursor-pointer rounded-xl focus-visible:outline-2 focus-visible:outline-primary"
         aria-label="Open now playing" @click="emit('open')">
          <img :src="track.image" alt="" width="48" height="48" decoding="async"
           class="h-12 w-12 rounded-xl object-cover shadow-sm"/>
        </button>

        <div class="min-w-0 flex-1">
          <button type="button" class="block max-w-full cursor-pointer truncate text-left text-sm font-semibold text-primary-text
           focus-visible:outline-2 focus-visible:outline-primary" @click="emit('open')">
            {{ track.title }}
          </button>
          <ArtistLinks :artists="artists" class="mt-0.5 text-xs text-text-muted"/>
        </div>
      </div>

      <PlayerFavoriteButton :track="track" size="md"/>

      <button type="button" :aria-label="isPlaying ? 'Pause' : 'Play'" :aria-pressed="isPlaying"
       class="group shrink-0 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
       active:scale-95 motion-reduce:transform-none" @click="togglePlay">
        <PlayButton :active="true" :playing="isPlaying" size="md"/>
      </button>
    </div>

    <!-- Thin progress line -->
    <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-light" aria-hidden="true">
      <div class="h-full bg-primary" :style="{ width: `${progressPercentage}%` }"></div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { usePlayer } from "@/composables/usePlayer";
import { usePlayerProgress } from "@/composables/usePlayerProgress";
import PlayButton from "@/components/music/PlayButton.vue";
import ArtistLinks from "@/components/music/player/ArtistLinks.vue";
import PlayerFavoriteButton from "@/components/music/player/PlayerFavoriteButton.vue";
import type { Track } from "@/types/music";
import type { TrackArtist } from "@/utils/trackArtists";

defineProps<{
  track: Track;
  artists: TrackArtist[];
}>();

const emit = defineEmits<{
  open: [];
}>();

const { isPlaying, togglePlay } = usePlayer();
const { progressPercentage } = usePlayerProgress();
</script>
