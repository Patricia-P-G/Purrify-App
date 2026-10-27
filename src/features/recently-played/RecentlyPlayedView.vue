<template>
  <!-- Recently Played Page -->
  <main class="px-4 py-5 sm:px-6 sm:py-8" aria-labelledby="recently-played-heading">

    <!-- Hero -->
    <MusicHeroLayout heading-id="recently-played-heading" label="History" title="Recently Played"
      description="A little rewind of what you have been listening to"
      :image="recentlyPlayed[0]?.largeImage" :song-count="recentlyPlayed.length">
      <template #actions>
        <PlayAllButton :disabled="filteredTracks.length === 0" @click="playAll"/>

        <div class="w-[85%] self-center sm:w-80 lg:w-76">
          <SearchBar v-model="searchQuery" />

          <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {{ searchStatus }}
          </p>
        </div>
      </template>
    </MusicHeroLayout>

    <!-- Loading -->
    <p v-if="isInitialLoading" class="sr-only" role="status" aria-live="polite">
      Loading recently played songs.
    </p>

    <!-- Error -->
    <div v-if="loadError"
      class="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700"
      role="alert">
      <p>
        {{ loadError }}
      </p>

      <button type="button"
        class="btn-base btn-sm mt-3 border border-primary bg-primary-pale text-primary hover:bg-primary-light"
        @click="loadRecentlyPlayed">
        Try again
      </button>
    </div>

    <!-- Song Table -->
    <TrackList v-if="!isInitialLoading && !loadError" :tracks="visibleTracks"
      list-label="Recently played songs" heading-id="recently-played-track-list-heading"
      :current-track-id="recentlyPlayedTrackId" :current-track-index="recentlyPlayedTrackIndex"
      :is-playing="isPlaying" :open-menu="openMenu" :is-favorite="isFavorite"
      @track-click="handleTrackClick" @favorite-click="handleFavoriteClick"
      @menu-click="toggleMenu">

      <template #loading>
        <div v-if="hasMore" ref="loadMoreTrigger"
          class="flex h-20 items-center justify-center gap-3">
          <template v-if="isLoadingMore">
            <div
              class="h-5 w-5 animate-spin rounded-full border-2 border-primary-light border-t-primary motion-reduce:animate-none"
              aria-hidden="true"></div>

            <span class="text-sm text-text-secondary" role="status">
              Loading more songs...
            </span>
          </template>
        </div>
      </template>
    </TrackList>

    <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ loadingAnnouncement }}
    </p>

    <p v-if="playbackMessage" class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ playbackMessage }}
    </p>

    <!-- Action Toast -->
    <ActionToast :show="showToast" :type="toastType" :action="toastAction" :track-name="toastTrackName" :playlist-name="toastPlaylistName"
      @close="closeToast"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useHead } from "@unhead/vue";
import { getRecentlyPlayed } from "@/services/spotify/api/recentlyPlayed";
import { usePlayer } from "@/composables/usePlayer";
import { useFavoriteActions } from "@/composables/useFavoritesActions";
import { useActionToast } from "@/composables/useActionToast";
import { useInfiniteScroll } from "@/composables/useInfiniteScroll";

import MusicHeroLayout from "@/components/music/MusicHeroLayout.vue";
import PlayAllButton from "@/components/ui/PlayAllButton.vue";
import SearchBar from "@/components/ui/SearchBar.vue";
import TrackList from "@/components/music/TrackList.vue";
import ActionToast from "@/components/ui/ActionToast.vue";

import type { Track, RecentlyPlayedTrack } from "@/types/music";

// Recently Played Tracks
const recentlyPlayed = ref<RecentlyPlayedTrack[]>([]);

// Search
const searchQuery = ref("");

// Track Menu
const openMenu = ref<number | null>(null);

// Loading and Errors
const isInitialLoading = ref(true);
const loadError = ref("");
const playbackMessage = ref("");

// Infinite Scroll
const visibleCount = ref(10);

// Player
const { currentTrack, currentIndex, isPlaying, playerSource, playTracks, togglePlay } = usePlayer();

// Checks Whether the Selected Track Belongs to Recently Played
const recentlyPlayedTrackId = computed(() => {
  return playerSource.value?.type === "recently-played" ? currentTrack.value?.id : undefined;
});

const recentlyPlayedTrackIndex = computed(() => {
  return playerSource.value?.type === "recently-played" ? currentIndex.value : -1;
});

// Favorites
const { isFavorite, handleFavoriteClick } = useFavoriteActions();

// Action Toast
const { showToast, toastType, toastAction, toastTrackName, toastPlaylistName, closeToast } = useActionToast();

// Filters Tracks by Title, Artist or Album
const filteredTracks = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();

  if (!query) {
    return recentlyPlayed.value;
  }

  return recentlyPlayed.value.filter(
    (track) =>
      track.title.toLowerCase().includes(query) ||
      track.artist.toLowerCase().includes(query) ||
      track.album.toLowerCase().includes(query)
  );
});

// Displays 10 Tracks Initially, Then 10 More When Scrolling
const visibleTracks = computed(() => {
  return filteredTracks.value.slice(0, visibleCount.value);
});

// Checks Whether More Songs Are Available
const hasMore = computed(() => {
  return !isInitialLoading.value &&
    !loadError.value &&
    visibleCount.value < filteredTracks.value.length;
});

// Reusable Infinite Scroll
const { loadMoreTrigger, isLoadingMore, loadingAnnouncement, reset } = useInfiniteScroll(hasMore, () => {
  const previousCount = visibleTracks.value.length;

  visibleCount.value = Math.min(
    visibleCount.value + 10,
    filteredTracks.value.length
  );

  const loadedCount = visibleTracks.value.length - previousCount;

  loadingAnnouncement.value = `${loadedCount} more songs loaded`;
});

// Announces Search Results to Screen Readers
const searchStatus = computed(() => {
  const query = searchQuery.value.trim();

  if (!query) {
    return `${recentlyPlayed.value.length} recently played songs available`;
  }

  if (!filteredTracks.value.length) {
    return `No songs found for ${query}`;
  }

  return `${filteredTracks.value.length} songs found for ${query}`;
});

// Updates SEO
useHead({
  title: "Recently Played | Purrify",
  meta: [
    {
      name: "description",
      content: "Revisit your recently played songs and listening history on Purrify.",
    },
  ],
});

// Plays a Track or Toggles Playback
const handleTrackClick = async (track: Track, index: number) => {
  playbackMessage.value = "";

  const isCurrentTrack =
    playerSource.value?.type === "recently-played" &&
    currentTrack.value?.id === track.id &&
    currentIndex.value === index;

  if (isCurrentTrack) {
    try {
      await togglePlay();
    } catch (error) {
      console.error("Failed to toggle recently played track:", error);
      playbackMessage.value = "Unable to control playback. Please try again.";
    }

    return;
  }

  try {
    await playTracks(filteredTracks.value, index, {
      type: "recently-played",
    });
  } catch (error) {
    console.error("Failed to play recently played track:", error);
    playbackMessage.value = "Unable to play this song. Please try again.";
  }
};

// Opens or Closes the Track Menu
const toggleMenu = (index: number) => {
  openMenu.value = openMenu.value === index ? null : index;
};

// Plays All Filtered Tracks
const playAll = async () => {
  if (!filteredTracks.value.length) {
    return;
  }

  playbackMessage.value = "";

  try {
    await playTracks(filteredTracks.value, 0, {
      type: "recently-played",
    });
  } catch (error) {
    console.error("Failed to play recently played songs:", error);
    playbackMessage.value = "Unable to start playback. Please try again.";
  }
};

// Gets Recently Played Songs From Spotify
const loadRecentlyPlayed = async () => {
  isInitialLoading.value = true;
  loadError.value = "";
  visibleCount.value = 10;
  reset();

  try {
    recentlyPlayed.value = await getRecentlyPlayed(50);
  } catch (error) {
    console.error("Failed to load recently played songs:", error);
    loadError.value = "We could not load your recently played songs.";
  } finally {
    isInitialLoading.value = false;
  }
};

// Resets Visible Tracks When Searching
watch(searchQuery, () => {
  visibleCount.value = 10;
  openMenu.value = null;
  reset();
});

// Loads Recently Played Songs When Page Mounts
onMounted(loadRecentlyPlayed);

</script>