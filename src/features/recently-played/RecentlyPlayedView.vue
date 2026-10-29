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

          <ScreenReaderStatus :message="searchStatus" />
        </div>
      </template>
    </MusicHeroLayout>

    <!-- Loading -->
    <p v-if="isInitialLoading" class="sr-only" role="status" aria-live="polite">
      Loading recently played songs.
    </p>

    <!-- Error -->
    <ErrorState v-if="loadError" variant="banner" :message="loadError" @retry="loadRecentlyPlayed" />

    <!-- Song Table -->
    <TrackList v-if="!isInitialLoading && !loadError" :tracks="visibleTracks"
      list-label="Recently played songs" heading-id="recently-played-track-list-heading"
      :current-track-id="activeTrackId" :current-track-index="activeTrackIndex"
      :is-playing="isPlaying" :open-menu="openMenu" :is-favorite="isFavorite"
      @track-click="handleTrackClick" @favorite-click="handleFavoriteClick"
      @menu-click="toggleMenu">

      <template #loading>
        <LoadMoreTrigger v-if="hasMore" ref="loadMoreTrigger" :loading="isLoadingMore" />
      </template>
    </TrackList>

    <ScreenReaderStatus :message="loadingAnnouncement" />

    <ScreenReaderStatus :message="playbackMessage" />

  </main>
</template>

<script setup lang="ts">
import LoadMoreTrigger from "@/components/ui/LoadMoreTrigger.vue";
import ScreenReaderStatus from "@/components/ui/ScreenReaderStatus.vue";
import { computed, onMounted, ref } from "vue";
import { useHead } from "@unhead/vue";
import { getRecentlyPlayed } from "@/services/spotify/api/recentlyPlayed";
import { useTrackListView } from "@/composables/useTrackListView";
import MusicHeroLayout from "@/components/music/MusicHeroLayout.vue";
import PlayAllButton from "@/components/ui/PlayAllButton.vue";
import SearchBar from "@/components/ui/SearchBar.vue";
import TrackList from "@/components/music/TrackList.vue";
import ErrorState from "@/components/ui/ErrorState.vue";
import type { RecentlyPlayedTrack } from "@/types/music";

// Recently Played Tracks
const recentlyPlayed = ref<RecentlyPlayedTrack[]>([]);
const isInitialLoading = ref(true);
const loadError = ref("");

// Shared list behavior (search, paging, playback, menu, favorites, toast)
const {
  searchQuery, searchStatus, filteredTracks, visibleTracks, hasMore,
  loadMoreTrigger, isLoadingMore, loadingAnnouncement, resetList,
  openMenu, toggleMenu, isPlaying, activeTrackId, activeTrackIndex,
  playbackMessage, handleTrackClick, playAll, isFavorite, handleFavoriteClick,
  } = useTrackListView(recentlyPlayed, {
  label: "recently played songs",
  source: () => ({ type: "recently-played" }),
  canLoadMore: computed(() => !isInitialLoading.value && !loadError.value),
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

// Gets Recently Played Songs From Spotify
const loadRecentlyPlayed = async () => {
  isInitialLoading.value = true;
  loadError.value = "";
  resetList();

  try {
    recentlyPlayed.value = await getRecentlyPlayed(50);
  } catch (error) {
    console.error("Failed to load recently played songs:", error);
    loadError.value = "We could not load your recently played songs.";
  } finally {
    isInitialLoading.value = false;
  }
};

onMounted(loadRecentlyPlayed);

</script>