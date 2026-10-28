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
      :current-track-id="activeTrackId" :current-track-index="activeTrackIndex" :is-playing="isPlaying" :open-menu="openMenu"
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
import { onMounted, ref } from "vue";
import { useHead } from "@unhead/vue";
import { useFavorites } from "@/composables/useFavorites";
import { useTrackListView } from "@/composables/useTrackListView";
import MusicHeroLayout from "@/components/music/MusicHeroLayout.vue";
import PlayAllButton from "@/components/ui/PlayAllButton.vue";
import SearchBar from "@/components/ui/SearchBar.vue";
import TrackList from "@/components/music/TrackList.vue";
import ActionToast from "@/components/ui/ActionToast.vue";

// Favorites
const { favoriteTracks, loadFavorites, isLoading } = useFavorites();
const loadError = ref(false);

// Shared list behavior (search, playback, menu, favorites, toast)
const {
  searchQuery, searchStatus, filteredTracks, openMenu, toggleMenu,
  isPlaying, activeTrackId, activeTrackIndex, playbackMessage, handleTrackClick, playAll,
  isFavorite, handleFavoriteClick,
  showToast, toastType, toastAction, toastTrackName, toastPlaylistName, closeToast
} = useTrackListView(favoriteTracks, {
  label: "favorite songs",
  source: () => ({ type: "favorites" }),
  paginate: false,
});

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