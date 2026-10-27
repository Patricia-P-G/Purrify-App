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

          <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {{ searchStatus }}
          </p>
        </div>
      </template>
    </MusicHeroLayout>

    <!-- Initial Loading -->
    <p v-if="isInitialLoading" class="sr-only" role="status" aria-live="polite">
      Loading album songs.
    </p>

    <!-- Error -->
    <div v-if="loadError" class="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
      {{ loadError }}
    </div>

    <!-- Track List -->
    <TrackList v-if="!isInitialLoading && !loadError" :tracks="visibleTracks" list-label="Album songs" heading-id="album-track-list-heading"
      :current-track-id="currentTrack?.id" :current-track-index="currentIndex" :is-playing="isPlaying" :open-menu="openMenu"
      :is-favorite="isFavorite" @track-click="handleTrackClick" @favorite-click="handleFavoriteClick" @menu-click="toggleMenu">
      <template #loading>
        <div v-if="hasMore" ref="loadMoreTrigger" class="flex h-20 items-center justify-center gap-3">
          <template v-if="isLoadingMore">

            <div class="h-5 w-5 animate-spin rounded-full border-2 border-primary-light border-t-primary motion-reduce:animate-none"
              aria-hidden="true">
            </div>

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

    <!-- Favorite Toast -->
    <ActionToast :show="showToast" :type="toastType" :action="toastAction" :track-name="toastTrackName" :playlist-name="toastPlaylistName"
      @close="closeToast"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useHead } from "@unhead/vue";
import { getAlbum, type AlbumDetails } from "@/services/spotify/api/album";
import { usePlayer } from "@/composables/usePlayer";
import { useFavoriteActions } from "@/composables/useFavoritesActions";
import { useActionToast } from "@/composables/useActionToast";
import { useInfiniteScroll } from "@/composables/useInfiniteScroll";
import MusicHeroLayout from "@/components/music/MusicHeroLayout.vue";
import PlayAllButton from "@/components/ui/PlayAllButton.vue";
import SearchBar from "@/components/ui/SearchBar.vue";
import TrackList from "@/components/music/TrackList.vue";
import ActionToast from "@/components/ui/ActionToast.vue";
import type { Track } from "@/types/music";

// Router
const route = useRoute();
const albumId = computed(() => route.params.id as string);

// Album
const album = ref<AlbumDetails | null>(null);
const searchQuery = ref("");
const isInitialLoading = ref(true);
const loadError = ref("");

// Track Menu
const openMenu = ref<number | null>(null);

const toggleMenu = (index: number) => {
  openMenu.value = openMenu.value === index ? null : index;
};

// Player
const { currentTrack, currentIndex, isPlaying, playTracks, togglePlay } = usePlayer();

// Favorites
const { isFavorite, handleFavoriteClick } = useFavoriteActions();

// Favorite Toast
const { showToast, toastType, toastAction, toastTrackName, toastPlaylistName, closeToast } = useActionToast();

// Filters Album Songs
const filteredTracks = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();

  if (!query) {
    return album.value?.tracks ?? [];
  }

  return (
    album.value?.tracks.filter(
      (track) =>
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        track.album.toLowerCase().includes(query)
    ) ?? []
  );
});

// Infinite Scroll
const visibleCount = ref(10);

const visibleTracks = computed(() =>
  filteredTracks.value.slice(0, visibleCount.value)
);

const hasMore = computed(() =>
  !isInitialLoading.value &&
  !loadError.value &&
  visibleCount.value < filteredTracks.value.length
);

const { loadMoreTrigger, isLoadingMore, loadingAnnouncement, reset } = useInfiniteScroll(hasMore, () => {
  visibleCount.value = Math.min(
    visibleCount.value + 10,
    filteredTracks.value.length
  );
});

// Search Accessibility
const searchStatus = computed(() => {
  const query = searchQuery.value.trim();

  if (!query) {
    return `${album.value?.tracks.length ?? 0} album songs available`;
  }

  if (!filteredTracks.value.length) {
    return `No songs found for ${query}`;
  }

  return `${filteredTracks.value.length} songs found for ${query}`;
});

// Plays Selected Track
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

// Plays All Tracks
const playAll = () => {
  if (!filteredTracks.value.length) return;

  playTracks(filteredTracks.value, 0);
};

// Updates SEO
useHead({
  title: computed(() =>
    album.value
      ? `${album.value.name} | Purrify`
      : "Album | Purrify"
  ),

  meta: [
    {
      name: "description",
      content: computed(() =>
        album.value
          ? `Listen to ${album.value.name} by ${album.value.artist} on Purrify.`
          : "Discover and listen to your favorite albums on Purrify."
      ),
    },
  ],
});

// Loads Album
let loadRequestId = 0;

const loadAlbum = async () => {
  const requestId = ++loadRequestId;

  try {
    isInitialLoading.value = true;
    loadError.value = "";
    album.value = null;
    visibleCount.value = 10;

    reset();

    const result = await getAlbum(albumId.value);

    if (requestId !== loadRequestId) return;

    album.value = result;
  } catch (error) {
    if (requestId !== loadRequestId) return;

    console.error("Failed to load album:", error);
    album.value = null;
    loadError.value = "We could not load this album. Please try again.";
  } finally {
    if (requestId === loadRequestId) {
      isInitialLoading.value = false;
    }
  }
};

// Resets Scroll When Searching
watch(searchQuery, () => {
  visibleCount.value = 10;
  openMenu.value = null;
  reset();
});

// Reloads When Album Changes
watch(albumId, () => {
  searchQuery.value = "";
  openMenu.value = null;
  void loadAlbum();
});

// Initializes Album
onMounted(() => {
  void loadAlbum();
});

// Cleans Up
onBeforeUnmount(() => {
  loadRequestId++;
});

</script>