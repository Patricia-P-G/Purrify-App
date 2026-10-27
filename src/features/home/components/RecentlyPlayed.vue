<template>
  <!-- Recently Played Section -->
  <section class="section-card"
    aria-labelledby="recently-played-heading" :aria-busy="isLoading">

    <!-- Header -->
    <div class="section-card-header">
      <!-- Title -->
      <h2 id="recently-played-heading" class="section-card-title">
        Recently played
      </h2>

      <!-- See All Button -->
      <SeeAllButton to="/recently-played" name="recently played songs"/>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" role="status">
      <span class="sr-only">
        Loading recently played songs...
      </span>

      <!-- Song Skeletons -->
      <ul class="flex flex-col gap-2" aria-hidden="true">
        <li v-for="index in RECENT_TRACK_LIMIT" :key="index">
          <div class="flex w-full items-center gap-3 rounded-2xl border border-transparent p-2.5">
            <!-- Image Skeleton -->
            <div class="h-14 w-14 shrink-0 rounded-2xl bg-surface-light"></div>

            <!-- Text Skeleton -->
            <div class="min-w-0 flex-1">
              <div class="h-4 w-2/3 rounded bg-surface-light"></div>
              <div class="mt-2 h-3 w-1/2 rounded bg-surface-light"></div>
            </div>

            <!-- Play Button Skeleton -->
            <div class="h-10 w-10 shrink-0 rounded-full bg-primary-pale"></div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="py-6 text-center" role="alert">
      <p class="text-sm text-text-secondary">
        {{ errorMessage }}
      </p>

      <button type="button" class="btn-base btn-sm mt-3 border border-primary bg-primary-pale text-primary hover:bg-primary-light"
        @click="loadRecentlyPlayed">
        Try again
      </button>
    </div>

    <!-- Recently Played List -->
    <ul v-else-if="recentlyPlayed.length" class="flex flex-col gap-2" aria-label="Recently played songs">
      <!-- Songs -->
      <li v-for="(track, index) in recentlyPlayed" :key="track.playedAt">
        <!-- Track Row Container -->
        <div class="song-card group flex w-full items-center gap-3 p-2.5"
          :class="{ 'song-card-active': isCurrentTrack(track) }">

          <!-- Album Cover Container -->
          <div class="relative h-14 w-14 shrink-0">
            <!-- Album Cover -->
            <img v-if="track.image" :src="track.image" alt="" loading="lazy" decoding="async" width="56" height="56"
              class="h-14 w-14 rounded-2xl object-cover shadow-[0_4px_10px_rgba(75,75,85,0.16)]
              transition duration-200 group-hover:shadow-[0_6px_14px_rgba(75,75,85,0.22)] motion-reduce:transition-none"
            />

            <!-- Image Fallback -->
            <div v-else class="h-14 w-14 rounded-2xl bg-surface-light" aria-hidden="true"></div>

            <!-- Hover Overlay -->
            <span class="pointer-events-none absolute inset-0 rounded-2xl bg-black/0 transition duration-200 group-hover:bg-black/5
              motion-reduce:transition-none" aria-hidden="true">
            </span>
          </div>

          <!-- Song Information Container -->
          <div class="min-w-0 flex-1">
            <!-- Song Title -->
            <h3 class="truncate text-sm font-semibold transition duration-200 motion-reduce:transition-none"
              :class="isCurrentTrack(track) ? 'text-primary' : 'text-primary-text'">
              {{ track.title }}
            </h3>

            <!-- Artists -->
            <p class="mt-0.5 truncate text-sm text-text-secondary">
              <template v-if="track.artists.length">
                <template v-for="(artist, artistIndex) in track.artists" :key="artist.id || artistIndex">
                  <span v-if="artistIndex > 0">, </span>

                  <RouterLink v-if="artist.id" :to="`/artists/${artist.id}`"
                    class="hover:underline hover:underline-offset-2 focus-visible:rounded-sm
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                    {{ artist.name }}
                  </RouterLink>

                  <span v-else>{{ artist.name }}</span>
                </template>
              </template>

              <!-- Artist Fallback -->
              <span v-else>{{ track.artist }}</span>
            </p>
          </div>

          <!-- Play / Pause Button -->
          <button type="button" class="shrink-0 cursor-pointer rounded-full disabled:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            :disabled="isPlaybackPending" :aria-label="isCurrentTrack(track) && isPlaying ? `Pause ${track.title} by ${track.artist}` : `Play ${track.title} by ${track.artist}`"
            @click="handleTrackClick(track, index)">
            <PlayButton :active="isCurrentTrack(track)" :playing="isCurrentTrack(track) && isPlaying"/>
          </button>
        </div>
      </li>
    </ul>

    <!-- Empty State -->
    <p v-else class="py-6 text-center text-sm text-text-secondary" role="status">
      No recently played songs yet.
    </p>

    <!-- Playback Status -->
    <p class="sr-only" role="status" aria-live="polite">
      {{ isPlaybackPending ? "Updating Spotify playback..." : "" }}
    </p>

    <!-- Playback Error -->
    <p v-if="playbackError" class="mt-3 text-sm text-primary" role="alert">
      {{ playbackError }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getRecentlyPlayed } from "@/services/spotify/api/recentlyPlayed";
import { usePlayer } from "@/composables/usePlayer";
import PlayButton from "@/components/music/PlayButton.vue";
import SeeAllButton from "@/components/ui/SeeAllButton.vue";
import type { RecentlyPlayedTrack } from "@/types/music";

// Number of Recently Played Songs Displayed on the Homepage
const RECENT_TRACK_LIMIT = 4;

// Recently Played Tracks
const recentlyPlayed = ref<RecentlyPlayedTrack[]>([]);

// UI State
const isLoading = ref(true);
const isPlaybackPending = ref(false);
const errorMessage = ref("");
const playbackError = ref("");

// Shared Player
const { currentTrackKey, playerSource, isPlaying, playTracks, togglePlay } = usePlayer();

// Checks Whether This Listening Occurrence Is Selected
const isCurrentTrack = (track: RecentlyPlayedTrack) => {
  return playerSource.value?.type === "recently-played" && currentTrackKey.value === track.playedAt;
};

// Gets Recently Played Songs from Spotify
const loadRecentlyPlayed = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    recentlyPlayed.value = await getRecentlyPlayed(RECENT_TRACK_LIMIT);
  } catch (error) {
    console.error("Failed to load recently played songs:", error);
    recentlyPlayed.value = [];
    errorMessage.value = "Unable to load recently played songs.";
  } finally {
    isLoading.value = false;
  }
};

// Plays a Track or Toggles Play/Pause
const handleTrackClick = async (track: RecentlyPlayedTrack, index: number) => {
  // Prevent Overlapping Playback Requests
  if (isPlaybackPending.value) {
    return;
  }

  isPlaybackPending.value = true;
  playbackError.value = "";

  try {
    // Toggle Current Track or Play Selected Track
    if (isCurrentTrack(track)) {
      await togglePlay();
    } else {
      await playTracks(recentlyPlayed.value, index, {
        type: "recently-played",
      });
    }
  } catch (error) {
    console.error("Failed to control track playback:", error);
    playbackError.value = `Unable to control playback for ${track.title}. Please try again.`;
  } finally {
    isPlaybackPending.value = false;
  }
};

// Load Recently Played Songs When Component Mounts
onMounted(loadRecentlyPlayed);

</script>