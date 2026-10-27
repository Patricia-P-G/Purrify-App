<template>
  <!-- Favorites Page -->
  <main class="px-4 py-5 sm:px-6 sm:py-8" aria-labelledby="favorites-heading">
    <MusicHeroLayout heading-id="favorites-heading" label="Favorites" title="Favorite Songs" description="All the songs you love in one place"
      :song-count="favoriteTracks.length">
      <template #cover>
        <div class="flex h-full w-full items-center justify-center bg-primary-light" aria-hidden="true">
          <img src="@/assets/icons/favorites-hover.svg" alt="" class="h-16 w-16" />
        </div>
      </template>

      <template #actions>
        <PlayAllButton :disabled="isLoading || filteredTracks.length === 0" @click="playAll"/>

        <div class="w-[85%] self-center sm:w-80 lg:w-76">
          <SearchBar v-model="searchQuery" />

          <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {{ searchStatus }}
          </p>
        </div>
      </template>
    </MusicHeroLayout>

    <!-- Loading Favorites -->
    <section v-if="isLoading" class="rounded-[28px] border border-border bg-surface px-6 py-16 text-center" role="status" aria-live="polite">
      <p class="text-sm text-text-secondary">
        Loading your favorite songs...
      </p>
    </section>

    <!-- Loading Error -->
    <section v-else-if="loadError" class="rounded-[28px] border border-border bg-surface px-6 py-16 text-center" role="alert">
      <h2 class="text-xl font-semibold text-primary-text">
        Could not load favorites
      </h2>

      <p class="mt-2 text-sm text-text-secondary">
        Please try again later.
      </p>
    </section>

    <!-- Favorite Tracks -->
    <TrackList v-else-if="filteredTracks.length" :tracks="filteredTracks" list-label="Favorite songs" heading-id="favorites-track-list-heading"
      :current-track-id="currentTrack?.id" :current-track-index="currentIndex" :is-playing="isPlaying" :open-menu="openMenu"
      :is-favorite="isFavorite" @track-click="handleTrackClick" @favorite-click="handleFavoriteClick" @menu-click="toggleMenu"
    />

    <!-- Empty Favorites -->
    <section v-else-if="!searchQuery" class="rounded-[28px] border border-border bg-surface px-6 py-16 text-center"
      aria-labelledby="empty-favorites-heading">
      <h2 id="empty-favorites-heading" class="text-xl font-semibold text-primary-text">
        No favorite songs yet
      </h2>

      <p class="mt-2 text-sm text-text-secondary">
        Songs you add to your favorites will appear here.
      </p>
    </section>

    <!-- No Search Results -->
    <section v-else class="rounded-[28px] border border-border bg-surface px-6 py-16 text-center" aria-labelledby="no-results-heading">
      <h2 id="no-results-heading" class="text-xl font-semibold text-primary-text">
        No songs found
      </h2>

      <p class="mt-2 text-sm text-text-secondary">
        Try searching for another song, artist or album.
      </p>
    </section>

    <!-- Action Toast -->
    <ActionToast :show="showToast" :type="toastType" :action="toastAction" :track-name="toastTrackName" :playlist-name="toastPlaylistName"
      @close="closeToast"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useHead } from "@unhead/vue";
import { usePlayer } from "@/composables/usePlayer";
import { useFavorites } from "@/composables/useFavorites";
import { useFavoriteActions } from "@/composables/useFavoritesActions";
import { useActionToast } from "@/composables/useActionToast";
import MusicHeroLayout from "@/components/music/MusicHeroLayout.vue";
import PlayAllButton from "@/components/ui/PlayAllButton.vue";
import SearchBar from "@/components/ui/SearchBar.vue";
import TrackList from "@/components/music/TrackList.vue";
import ActionToast from "@/components/ui/ActionToast.vue";
import type { Track } from "@/types/music";

// Search State
const searchQuery = ref("");

// Track Menu
const openMenu = ref<number | null>(null);

// Error State
const loadError = ref(false);

// Player
const { currentTrack, currentIndex, isPlaying, playTracks, togglePlay } = usePlayer();

// Favorites
const { favoriteTracks, loadFavorites, isLoading } = useFavorites();

// Favorite Actions
const { isFavorite, handleFavoriteClick } = useFavoriteActions();

// Action Toast
const { showToast, toastType, toastAction, toastTrackName, toastPlaylistName, closeToast } = useActionToast();

// Page SEO
useHead({
  title: "Favorite Songs | Purrify",

  meta: [
    {
      name: "description",
      content: "Listen to and manage your favorite songs on Purrify.",
    },
  ],
});

// Filter Favorite Tracks
const filteredTracks = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();

  if (!query) return favoriteTracks.value;

  return favoriteTracks.value.filter((track) =>
    track.title.toLowerCase().includes(query) ||
    track.artist.toLowerCase().includes(query) ||
    track.album?.toLowerCase().includes(query)
  );
});

// Search Accessibility
const searchStatus = computed(() => {
  const query = searchQuery.value.trim();

  if (isLoading.value) return "Loading favorite songs";
  if (loadError.value) return "Could not load favorite songs";

  if (!query) return `${favoriteTracks.value.length} favorite songs available`;
  if (!filteredTracks.value.length) return `No songs found for ${query}`;

  return `${filteredTracks.value.length} songs found for ${query}`;
});

// Handle Track Click
const handleTrackClick = (track: Track, index: number) => {
  if (
    currentTrack.value?.id === track.id &&
    currentIndex.value === index
  ) {
    togglePlay();
    return;
  }

  playTracks(filteredTracks.value, index);
};

// Toggle Track Menu
const toggleMenu = (index: number) => {
  openMenu.value = openMenu.value === index ? null : index;
};

// Play All Favorites
const playAll = () => {
  if (!filteredTracks.value.length) return;

  playTracks(filteredTracks.value, 0);
};

// Load Favorites
onMounted(async () => {
  try {
    await loadFavorites();
  } catch (error) {
    console.error("Failed to load favorite songs:", error);
    loadError.value = true;
  }
});

</script>