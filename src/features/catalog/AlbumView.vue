<template>
  <!-- Album Page -->
  <main class="px-4 py-5 sm:px-6 sm:py-8" aria-labelledby="album-heading">
    <!-- Hero -->
    <MusicHeroLayout heading-id="album-heading" label="Album" :title="album?.name ?? 'Album'" :description="album?.artist ?? ''"
      :image="album?.image" :song-count="filteredTracks.length">

      <template #actions>
        <PlayAllButton :disabled="filteredTracks.length === 0" @click="playAll"/>

        <!-- Search -->
        <div class="w-[85%] self-center sm:w-80 lg:w-76">
          <SearchBar v-model="searchQuery" />

          <ScreenReaderStatus :message="searchStatus" />
        </div>
      </template>
    </MusicHeroLayout>

    <!-- Initial Loading -->
    <p v-if="isInitialLoading" class="sr-only" role="status" aria-live="polite">
      Loading album songs.
    </p>

    <!-- Error -->
    <ErrorState v-if="loadError" variant="banner" :message="loadError" @retry="loadAlbum" />

    <!-- Track List -->
    <TrackList v-if="!isInitialLoading && !loadError" :tracks="visibleTracks" list-label="Album songs" heading-id="album-track-list-heading"
      :current-track-id="activeTrackId" :current-track-index="activeTrackIndex" :is-playing="isPlaying" :open-menu="openMenu"
      :is-favorite="isFavorite" @track-click="handleTrackClick" @favorite-click="handleFavoriteClick" @menu-click="toggleMenu">
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useHead } from "@unhead/vue";
import { getAlbum, type AlbumDetails } from "@/services/spotify/api/album";
import { useTrackListView } from "@/composables/useTrackListView";
import MusicHeroLayout from "@/components/music/MusicHeroLayout.vue";
import PlayAllButton from "@/components/ui/PlayAllButton.vue";
import SearchBar from "@/components/ui/SearchBar.vue";
import TrackList from "@/components/music/TrackList.vue";
import ErrorState from "@/components/ui/ErrorState.vue";

// Router
const route = useRoute();
const albumId = computed(() => route.params.id as string);

// Album
const album = ref<AlbumDetails | null>(null);
const isInitialLoading = ref(true);
const loadError = ref("");

// Shared list behavior (search, paging, playback, menu, favorites, toast)
const {
  searchQuery, searchStatus, filteredTracks, visibleTracks, hasMore,
  loadMoreTrigger, isLoadingMore, loadingAnnouncement, resetList,
  openMenu, toggleMenu, isPlaying, activeTrackId, activeTrackIndex,
  playbackMessage, handleTrackClick, playAll, isFavorite, handleFavoriteClick,
  } = useTrackListView(
  computed(() => album.value?.tracks ?? []),
  {
    label: "album songs",
    source: () => ({ type: "album", id: albumId.value }),
    canLoadMore: computed(() => !isInitialLoading.value && !loadError.value),
  },
);

// Updates SEO
useHead({
  title: computed(() =>
    album.value ? `${album.value.name} | Purrify` : "Album | Purrify",
  ),
  meta: [
    {
      name: "description",
      content: computed(() =>
        album.value
          ? `Listen to ${album.value.name} by ${album.value.artist} on Purrify.`
          : "Discover and listen to your favorite albums on Purrify.",
      ),
    },
  ],
});

// Loads Album (ignores responses from outdated requests)
let loadRequestId = 0;

const loadAlbum = async () => {
  const requestId = ++loadRequestId;

  isInitialLoading.value = true;
  loadError.value = "";
  album.value = null;
  resetList();

  try {
    const result = await getAlbum(albumId.value);

    if (requestId !== loadRequestId) return;

    album.value = result;
  } catch (error) {
    if (requestId !== loadRequestId) return;

    console.error("Failed to load album:", error);
    loadError.value = "We could not load this album. Please try again.";
  } finally {
    if (requestId === loadRequestId) {
      isInitialLoading.value = false;
    }
  }
};

// Reloads When Album Changes
watch(albumId, () => {
  searchQuery.value = "";
  void loadAlbum();
});

onMounted(() => {
  void loadAlbum();
});

onBeforeUnmount(() => {
  loadRequestId++;
});

</script>