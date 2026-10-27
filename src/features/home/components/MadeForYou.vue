<template>
  <!-- Made for You Section -->
  <section class="section-card"
    aria-labelledby="made-for-you-heading" :aria-busy="isLoading">

    <!-- Header -->
    <div class="section-card-header">
      <!-- Title -->
      <h2 id="made-for-you-heading" class="section-card-title">
        Made for you
      </h2>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" role="status" aria-live="polite">
      <span class="sr-only">
        Loading Made for You playlists...
      </span>

      <!-- Playlist Skeletons -->
      <ul class="grid w-full grid-cols-2 gap-5 sm:grid-cols-4" aria-hidden="true">
        <li v-for="index in 4" :key="index" class="min-w-0">
          <div class="aspect-square w-full rounded-2xl bg-surface-light"></div>
          <div class="mt-2 h-4 w-3/4 rounded bg-surface-light"></div>
        </li>
      </ul>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="py-6 text-center" role="alert">
      <p class="text-sm text-text-secondary">
        {{ errorMessage }}
      </p>

      <button type="button" class="btn-base btn-sm mt-3 border border-primary bg-primary-pale text-primary hover:bg-primary-light"
        @click="loadPlaylists">
        Try again
      </button>
    </div>

    <!-- Playlists -->
    <ul v-else-if="playlists.length" class="grid w-full grid-cols-2 gap-5 sm:grid-cols-4" aria-label="Made for you playlists">
      <li v-for="playlist in playlists" :key="playlist.id" class="min-w-0">
        <!-- Playlist Button -->
        <button type="button" class="group w-full cursor-pointer text-left transition duration-200 hover:scale-[1.03] focus-visible:rounded-2xl
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]
          motion-reduce:transform-none motion-reduce:transition-none"
          :aria-label="loadingPlaylistId === playlist.id ? `Loading ${playlist.title}` : isActivePlaylist(playlist) && isPlaying ? `Pause ${playlist.title}` : `Play ${playlist.title}`"
          :aria-pressed="isActivePlaylist(playlist) && isPlaying" :aria-busy="loadingPlaylistId === playlist.id"
          @click="playPlaylist(playlist)">

          <!-- Playlist Cover -->
          <div class="relative">
            <!-- Image -->
            <img v-if="playlist.image" :src="playlist.image" alt="" loading="lazy" decoding="async" width="300" height="300"
              class="aspect-square w-full rounded-2xl object-cover"/>

            <!-- Image Fallback -->
            <div v-else class="aspect-square w-full rounded-2xl bg-surface-light" aria-hidden="true"></div>

            <!-- Play / Pause Indicator -->
            <div v-if="isActivePlaylist(playlist)" class="pointer-events-none absolute bottom-3 right-3 z-10" aria-hidden="true">
              <PlayButton :active="true" :playing="isPlaying"/>
            </div>
          </div>

          <!-- Playlist Title -->
          <h3 class="mt-2 truncate text-sm font-semibold"
            :class="isActivePlaylist(playlist) ? 'text-primary' : 'text-primary-text'">
            {{ playlist.title }}
          </h3>
        </button>
      </li>
    </ul>

    <!-- Empty State -->
    <p v-else class="py-6 text-center text-sm text-text-secondary" role="status">
      No playlists available.
    </p>

    <!-- Playback Error -->
    <p v-if="playbackError" class="mt-3 text-sm text-primary" role="alert">
      {{ playbackError }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getMadeForYouPlaylists, getMoodTracks, type MadeForYouPlaylist } from "@/services/spotify/api/madeForYou";
import { usePlayer } from "@/composables/usePlayer";
import PlayButton from "@/components/music/PlayButton.vue";

// Made for You Playlists
const playlists = ref<MadeForYouPlaylist[]>([]);

// Playlist Currently Loading
const loadingPlaylistId = ref<string | null>(null);

// UI State
const isLoading = ref(true);
const isPlaybackPending = ref(false);
const errorMessage = ref("");
const playbackError = ref("");

// Shared Player
const { playerSource, isPlaying, playTracks, togglePlay } = usePlayer();

// Checks Whether This Playlist Owns the Current Queue
const isActivePlaylist = (playlist: MadeForYouPlaylist) => {
  return (
    playerSource.value?.type === "made-for-you" &&
    playerSource.value.id === playlist.id
  );
};

// Gets Made for You Playlists
const loadPlaylists = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    playlists.value = await getMadeForYouPlaylists();
  } catch (error) {
    console.error("Failed to load Made for You playlists:", error);
    errorMessage.value = "Unable to load playlists.";
  } finally {
    isLoading.value = false;
  }
};

// Plays a Playlist or Toggles the Current Playlist
const playPlaylist = async (playlist: MadeForYouPlaylist) => {
  // Prevent Overlapping Playback Requests
  if (isPlaybackPending.value) {
    return;
  }

  isPlaybackPending.value = true;
  playbackError.value = "";

  try {
    // Toggle Current Playlist
    if (isActivePlaylist(playlist)) {
      await togglePlay();
      return;
    }

    // Load New Playlist
    loadingPlaylistId.value = playlist.id;

    const tracks = await getMoodTracks(playlist.query);

    // No Tracks Available
    if (!tracks.length) {
      playbackError.value = `No tracks are available for ${playlist.title} right now.`;
      return;
    }

    // Send the Queue and Its Source to the Shared Player
    await playTracks(tracks, 0, {
      type: "made-for-you",
      id: playlist.id,
    });
  } catch (error) {
    console.error("Failed to control playlist playback:", error);
    playbackError.value = `Unable to control playback for ${playlist.title}. Please try again.`;
  } finally {
    loadingPlaylistId.value = null;
    isPlaybackPending.value = false;
  }
};

// Load Playlists When Component Mounts
onMounted(loadPlaylists);

</script>