<template>
  <!-- Recommended for You Section -->
  <section class="section-card"
    aria-labelledby="recommended-heading" :aria-busy="isLoading">

    <!-- Header -->
    <div class="section-card-header">
      <!-- Title -->
      <h2 id="recommended-heading" class="section-card-title">
        Recommended for you
      </h2>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" role="status" aria-live="polite">
      <span class="sr-only">
        Loading recommended songs...
      </span>

      <!-- Song Skeletons -->
      <ul class="flex flex-col gap-2" aria-hidden="true">
        <li v-for="index in 4" :key="index">
          <div class="flex w-full items-center gap-3 rounded-2xl border border-transparent p-2.5">

            <!-- Track Number Skeleton -->
            <div class="hidden h-4 w-6 shrink-0 rounded bg-surface-light lg:block"></div>

            <!-- Album Cover Skeleton -->
            <div class="h-14 w-14 shrink-0 rounded-xl bg-surface-light"></div>

            <!-- Track Information Skeleton -->
            <div class="min-w-0 flex-1">
              <div class="h-4 w-2/3 rounded bg-surface-light"></div>
              <div class="mt-2 h-3 w-1/3 rounded bg-surface-light"></div>
            </div>

            <!-- Album Skeleton -->
            <div class="hidden h-4 w-24 rounded bg-surface-light lg:block"></div>

            <!-- Duration Skeleton -->
            <div class="hidden h-4 w-10 rounded bg-surface-light lg:block"></div>

            <!-- Favorite Skeleton -->
            <div class="h-9 w-9 shrink-0 rounded-full bg-primary-pale"></div>

            <!-- Menu Skeleton -->
            <div class="h-9 w-9 shrink-0 rounded-full bg-primary-pale"></div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Error State -->
    <ErrorState v-else-if="errorMessage" :message="errorMessage" @retry="loadRecommendations" />

    <!-- Recommended Songs -->
    <TrackList v-else-if="recommendedSongs.length" :tracks="recommendedSongs" list-label="Recommended songs" heading-id="recommended-track-list-heading"
      :current-track-id="recommendedTrackId" :current-track-index="recommendedTrackIndex" :is-playing="isPlaying" :open-menu="openMenu" :is-favorite="isFavorite"
      :show-header="false" embedded @track-click="handleTrackClick" @favorite-click="handleFavoriteClick" @menu-click="toggleMenu"
    />

    <!-- Empty State -->
    <div v-else class="py-6 text-center" role="status">
      <p class="mb-4 text-sm text-text-secondary">
        Discover songs based on your favorite artists.
      </p>

      <button type="button" class="btn-base btn-sm bg-primary text-white hover:bg-primary-hover" @click="loadRecommendations">
        Get recommendations
      </button>
    </div>

    <!-- Playback Error -->
    <p v-if="playbackError" class="mt-3 text-sm text-primary" role="alert">
      {{ playbackError }}
    </p>

    <!-- Action Toast -->
    <ActionToast :show="showToast" :type="toastType" :action="toastAction" :track-name="toastTrackName"
     :playlist-name="toastPlaylistName" @close="closeToast"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import ErrorState from "@/components/ui/ErrorState.vue";
import { getRecommendedSongs } from "@/services/spotify/api/recommendedForYou";
import { usePlayer } from "@/composables/usePlayer";
import { useFavoriteActions } from "@/composables/useFavoritesActions";
import { useActionToast } from "@/composables/useActionToast";
import TrackList from "@/components/music/TrackList.vue";
import ActionToast from "@/components/ui/ActionToast.vue";
import type { Track } from "@/types/music";

// Recommended Songs
const recommendedSongs = ref<Track[]>([]);

// UI State
const isLoading = ref(true);
const isPlaybackPending = ref(false);
const errorMessage = ref("");
const playbackError = ref("");

// Track Menu
const openMenu = ref<number | null>(null);

// Shared Player
const { currentTrack, currentIndex, playerSource, isPlaying, playTracks, togglePlay } = usePlayer();

// Checks Whether the Selected Track Belongs to Recommended for You
const recommendedTrackId = computed(() => {
  return playerSource.value?.type === "recommended" ? currentTrack.value?.id : undefined;
});

const recommendedTrackIndex = computed(() => {
  return playerSource.value?.type === "recommended" ? currentIndex.value : -1;
});

// Favorites
const { isFavorite, handleFavoriteClick: toggleFavoriteTrack } = useFavoriteActions();

// Action Toast
const { showToast, toastType, toastAction, toastTrackName, toastPlaylistName, closeToast } = useActionToast();

// Gets Recommended Songs from Spotify
const loadRecommendations = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    recommendedSongs.value = await getRecommendedSongs();
  } catch (error) {
    console.error("Failed to load recommended songs:", error);
    errorMessage.value = "Unable to load recommended songs.";
  } finally {
    isLoading.value = false;
  }
};

// Plays a Track or Toggles Play/Pause
const handleTrackClick = async (track: Track, index: number) => {
  // Prevent Overlapping Playback Requests
  if (isPlaybackPending.value) {
    return;
  }

  isPlaybackPending.value = true;
  playbackError.value = "";

  try {
    // Check Whether the Track Is Already Selected
    const isCurrentTrack =
      playerSource.value?.type === "recommended" &&
      currentTrack.value?.id === track.id &&
      currentIndex.value === index;

    // Toggle Current Track
    if (isCurrentTrack) {
      await togglePlay();
      return;
    }

    // Play Selected Track
    await playTracks(recommendedSongs.value, index, {
      type: "recommended",
    });
  } catch (error) {
    console.error("Failed to control recommended track:", error);
    playbackError.value = `Unable to control playback for ${track.title}. Please try again.`;
  } finally {
    isPlaybackPending.value = false;
  }
};

// Adds or Removes a Song from Favorites
const handleFavoriteClick = (track: Track) => {
  openMenu.value = null;
  void toggleFavoriteTrack(track);
};

// Opens or Closes the Track Menu
const toggleMenu = (index: number) => {
  openMenu.value = openMenu.value === index ? null : index;
};

// Load Recommendations When Component Mounts
onMounted(loadRecommendations);

</script>