<template>
  <section class="fixed inset-0 z-100 flex flex-col overflow-hidden bg-background px-5 pb-8 pt-5 lg:hidden" aria-label="Now playing">
    <header class="flex shrink-0 items-center justify-between">
      <div class="h-11 w-11 shrink-0" aria-hidden="true"></div>

      <div class="min-w-0 flex-1 px-3 text-center">
        <p class="text-[11px] font-medium uppercase tracking-[0.16em] text-text-muted">
          Now playing
        </p>
        <p class="mt-0.5 truncate text-sm font-semibold text-primary-text">
          {{ track.title }}
        </p>
      </div>

      <button type="button" aria-label="Close now playing"
       class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-text-muted transition hover:bg-primary-light
       hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-90
       motion-reduce:transform-none motion-reduce:transition-none" @click="emit('close')">
        <img src="@/assets/icons/close.svg" alt="" aria-hidden="true" width="20" height="20" class="h-5 w-5"/>
      </button>
    </header>

    <!-- Album Cover -->
    <div class="flex min-h-0 flex-1 items-center justify-center py-6">
      <img :src="track.largeImage || track.image" :alt="`${track.album} album cover`" width="360" height="360" decoding="async"
       class="aspect-square w-full max-w-90 rounded-[28px] object-cover shadow-[0_20px_55px_rgba(75,75,85,0.18)]"/>
    </div>

    <!-- Song Controls -->
    <div class="mx-auto w-full max-w-md shrink-0">
      <div class="flex items-center gap-4">
        <div class="min-w-0 flex-1">
          <h1 class="truncate text-xl font-semibold text-primary-text">
            {{ track.title }}
          </h1>
          <!-- Closes the full player when the user opens an artist page -->
          <ArtistLinks :artists="artists" class="mt-1 text-sm text-text-muted" @navigate="emit('close')"/>
        </div>

        <PlayerFavoriteButton :track="track" size="lg"/>
      </div>

      <!-- Progress -->
      <div class="mt-6">
        <PlayerSeekBar large/>

        <div class="mt-2 flex items-center justify-between text-xs text-text-muted">
          <span>{{ formattedPosition }}</span>
          <span>{{ formattedDuration }}</span>
        </div>
      </div>

      <!-- Controls -->
      <div class="mt-5 flex items-center justify-center gap-8">
        <button type="button" aria-label="Previous track" :disabled="!hasMultipleTracks"
         class="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-text-secondary transition
         hover:bg-primary-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-90
         disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transform-none motion-reduce:transition-none" @click="previousTrack">
          <img src="@/assets/icons/skip-back.svg" alt="" width="24" height="24" class="h-6 w-6" aria-hidden="true"/>
        </button>

        <button type="button" :aria-label="isPlaying ? 'Pause' : 'Play'" :aria-pressed="isPlaying"
         class="group cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
         active:scale-95 motion-reduce:transform-none" @click="togglePlay">
          <PlayButton :active="true" :playing="isPlaying" size="lg"/>
        </button>

        <button type="button" aria-label="Next track" :disabled="!hasMultipleTracks"
         class="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-text-secondary transition
         hover:bg-primary-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-90
         disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transform-none motion-reduce:transition-none" @click="nextTrack">
          <img src="@/assets/icons/skip-forward.svg" alt="" width="24" height="24" class="h-6 w-6" aria-hidden="true"/>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { usePlayer } from "@/composables/usePlayer";
import { usePlayerProgress } from "@/composables/usePlayerProgress";
import PlayButton from "@/components/music/PlayButton.vue";
import ArtistLinks from "@/components/music/player/ArtistLinks.vue";
import PlayerFavoriteButton from "@/components/music/player/PlayerFavoriteButton.vue";
import PlayerSeekBar from "@/components/music/player/PlayerSeekBar.vue";
import type { Track } from "@/types/music";
import type { TrackArtist } from "@/utils/trackArtists";

defineProps<{
  track: Track;
  artists: TrackArtist[];
}>();

const emit = defineEmits<{
  close: [];
}>();

const { isPlaying, hasMultipleTracks, togglePlay, nextTrack, previousTrack } = usePlayer();
const { formattedPosition, formattedDuration } = usePlayerProgress();
</script>
