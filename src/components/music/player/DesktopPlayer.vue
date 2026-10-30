<template>
  <section class="fixed bottom-0 left-0 right-0 z-50 hidden border-t border-primary-light bg-background/95 px-8 py-5
   shadow-[0_-8px_30px_rgba(75,75,85,0.10)] backdrop-blur-md lg:block" aria-label="Music player">
    <div class="mx-auto grid max-w-[1600px] grid-cols-[1fr_1.4fr_1fr] items-center gap-8">
      <!-- Song Content -->
      <div class="flex min-w-0 items-center gap-3">
        <img :src="track.image" alt="" width="56" height="56" decoding="async"
         class="h-14 w-14 shrink-0 rounded-xl object-cover shadow-sm"/>

        <div class="min-w-0">
          <h2 class="truncate text-base font-semibold text-primary-text">
            {{ track.title }}
          </h2>
          <ArtistLinks :artists="artists" class="mt-0.5 text-sm text-text-muted"/>
        </div>

        <PlayerFavoriteButton :track="track" size="sm" class="ml-1"/>
      </div>

      <!-- Player Controls -->
      <div class="flex min-w-0 flex-col items-center justify-center">
        <div class="flex items-center justify-center gap-5">
          <button type="button" aria-label="Previous track" :disabled="!hasMultipleTracks"
           class="group/previous flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-text-secondary transition hover:bg-primary-light
           hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95
           disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transform-none motion-reduce:transition-none" @click="previousTrack">
            <span class="relative block h-5 w-5" aria-hidden="true">
              <img src="@/assets/icons/skip-back.svg" alt="" width="20" height="20" class="block h-5 w-5 group-hover/previous:hidden"/>
              <img src="@/assets/icons/skip-back-hover.svg" alt="" width="20" height="20" class="hidden h-5 w-5 group-hover/previous:block"/>
            </span>
          </button>

          <button type="button" :aria-label="isPlaying ? 'Pause' : 'Play'" :aria-pressed="isPlaying"
           class="group cursor-pointer rounded-full transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2
           focus-visible:outline-primary active:scale-95 motion-reduce:transform-none motion-reduce:transition-none" @click="togglePlay">
            <PlayButton :active="true" :playing="isPlaying" size="md"/>
          </button>

          <button type="button" aria-label="Next track" :disabled="!hasMultipleTracks"
           class="group/next flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-text-secondary transition hover:bg-primary-light
           hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95
           disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transform-none motion-reduce:transition-none" @click="nextTrack">
            <span class="relative block h-5 w-5" aria-hidden="true">
              <img src="@/assets/icons/skip-forward.svg" alt="" width="20" height="20" class="block h-5 w-5 group-hover/next:hidden"/>
              <img src="@/assets/icons/skip-forward-hover.svg" alt="" width="20" height="20" class="hidden h-5 w-5 group-hover/next:block"/>
            </span>
          </button>
        </div>

        <!-- Progress -->
        <div class="mt-3 flex w-full max-w-sm items-center gap-2">
          <span class="w-9 text-right text-[11px] text-text-muted">{{ formattedPosition }}</span>
          <PlayerSeekBar class="flex-1"/>
          <span class="w-9 text-[11px] text-text-muted">{{ formattedDuration }}</span>
        </div>
      </div>

      <!-- Volume and Close -->
      <div class="flex items-center justify-end gap-3">
        <PlayerVolume/>

        <button type="button" aria-label="Close music player"
         class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-text-muted transition hover:bg-primary-light
         hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95
         motion-reduce:transform-none motion-reduce:transition-none" @click="closePlayer">
          <img src="@/assets/icons/close.svg" alt="" aria-hidden="true" width="20" height="20" class="h-5 w-5"/>
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
import PlayerVolume from "@/components/music/player/PlayerVolume.vue";
import type { Track } from "@/types/music";
import type { TrackArtist } from "@/utils/trackArtists";

defineProps<{
  track: Track;
  artists: TrackArtist[];
}>();

const { isPlaying, hasMultipleTracks, togglePlay, nextTrack, previousTrack, closePlayer } = usePlayer();
const { formattedPosition, formattedDuration } = usePlayerProgress();

</script>

