<template>
  <main class="w-full" aria-labelledby="search-results-heading">
    <!-- No Search Yet -->
    <section v-if="!searchQuery"
      class="rounded-[28px] border border-border bg-surface p-8 shadow-[0_14px_42px_rgba(75,75,85,0.18)]">
      <h1 id="search-results-heading" class="text-2xl font-semibold text-primary-text">
        Search Purrify
      </h1>

      <p class="mt-2 text-sm text-text-secondary">
        Search for songs, albums and artists.
      </p>
    </section>

    <!-- Loading State -->
    <section v-else-if="isLoading"
      class="rounded-[28px] border border-border bg-surface p-8 shadow-[0_14px_42px_rgba(75,75,85,0.18)]"
      aria-labelledby="search-results-heading" aria-busy="true">

      <h1 id="search-results-heading" class="sr-only">
        Search results
      </h1>

      <p class="text-center text-sm text-text-muted" role="status" aria-live="polite">
        Searching for "{{ searchQuery }}"...
      </p>
    </section>

    <!-- Error State -->
    <section v-else-if="loadError"
      class="rounded-[28px] border border-border bg-surface p-8 shadow-[0_14px_42px_rgba(75,75,85,0.18)]"
      aria-labelledby="search-results-heading">

      <h1 id="search-results-heading" class="sr-only">
        Search results
      </h1>

      <p class="text-center text-sm text-text-muted" role="alert">
        {{ loadError }}
      </p>
    </section>

    <!-- Search Results -->
    <section v-else
      class="overflow-hidden rounded-[28px] border border-border bg-surface shadow-[0_14px_42px_rgba(75,75,85,0.18)]">

      <!-- Heading -->
      <div class="px-6 py-6 sm:px-8">
        <h1 id="search-results-heading" class="text-xl font-semibold text-primary-text sm:text-2xl">
          Search results for
          <span class="text-primary">"{{ searchQuery }}"</span>
        </h1>
      </div>

      <!-- Songs -->
      <section class="px-6 py-6 sm:px-8" aria-labelledby="search-songs-heading">
        <div class="mb-4 flex items-center justify-between">
          <h2 id="search-songs-heading" class="text-lg font-semibold text-primary-text">
            Songs
          </h2>
        </div>

        <TrackList :tracks="results.tracks.slice(0, 5)" list-label="Song search results"
          heading-id="search-song-list-heading" :current-track-id="currentTrack?.id"
          :current-track-index="currentIndex" :is-playing="isPlaying"
          :open-menu="openMenu" :is-favorite="isFavorite" :show-header="false" :embedded="true"
          @track-click="handleTrackClick" @favorite-click="handleFavoriteClick" @menu-click="toggleMenu"
        />
      </section>

      <!-- Albums -->
      <section class="border-t border-border px-6 py-6 sm:px-8">
        <AlbumSection
          :albums="searchAlbums"
          title="Albums"
          heading-id="search-albums-heading"
          variant="search"
          unstyled
        />
      </section>

      <!-- Artists -->
      <section class="border-t border-border px-6 py-6 sm:px-8" aria-labelledby="search-artists-heading">
        <div class="mb-4 flex items-center justify-between">
          <h2 id="search-artists-heading" class="text-lg font-semibold text-primary-text">
            Artists
          </h2>
        </div>

        <ul v-if="results.artists.length"
          class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Artist search results">

          <li v-for="artist in results.artists.slice(0, 4)" :key="artist.id">
            <RouterLink :to="{ name: 'artist', params: { id: artist.id } }"
              class="group flex items-center gap-3 rounded-2xl border border-border p-3 transition duration-200
              hover:border-border-pink hover:bg-primary-pale hover:shadow-sm focus-visible:outline-2
              focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"
              :aria-label="`View ${artist.name} artist page`">

              <!-- Artist Image -->
              <img v-if="artist.image" :src="artist.image" :alt="`${artist.name} profile picture`"
                loading="lazy" decoding="async" width="56" height="56"
                class="h-14 w-14 shrink-0 rounded-full object-cover"/>

              <!-- Artist Image Fallback -->
              <div v-else
                class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-light"
                aria-hidden="true">
                <img src="@/assets/icons/music.svg" alt="" class="h-5 w-5"/>
              </div>

              <!-- Artist Information -->
              <div class="min-w-0 flex-1">
                <h3 class="truncate text-sm font-semibold text-primary-text">
                  {{ artist.name }}
                </h3>

                <p class="mt-0.5 text-xs text-text-secondary">
                  Artist
                </p>
              </div>
            </RouterLink>
          </li>
        </ul>

        <p v-else class="py-4 text-sm text-text-muted" role="status">
          No artists found.
        </p>
      </section>
    </section>

  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useHead } from "@unhead/vue";
import { searchSpotify, type SearchResults } from "@/services/spotify/api/search";
import { usePlayer } from "@/composables/usePlayer";
import { useFavoriteActions } from "@/composables/useFavoritesActions";

import TrackList from "@/components/music/TrackList.vue";
import AlbumSection from "@/components/music/AlbumSection.vue";

import type { Track } from "@/types/music";

// Router
const route = useRoute();

// Shared Player
const { currentTrack, currentIndex, isPlaying, playTracks, togglePlay } = usePlayer();

// Favorites
const { isFavorite, handleFavoriteClick } = useFavoriteActions();

// Action Toast

// Search Results Returned by Spotify
const results = ref<SearchResults>({
  tracks: [],
  albums: [],
  artists: [],
});

// Formats Search Albums for AlbumSection
const searchAlbums = computed(() =>
  results.value.albums.slice(0, 4).map((album) => ({
    id: album.id,
    name: album.title,
    image: album.image,
    artist: album.artist,
    year: album.releaseDate?.slice(0, 4) ?? "",
    type: "album",
  }))
);

// UI State
const isLoading = ref(false);
const loadError = ref("");
const openMenu = ref<number | null>(null);

// Prevents Outdated Search Requests from Updating Results
let searchRequestId = 0;

// Gets the Search Query from the URL
const searchQuery = computed(() => {
  const query = route.query.q;
  return typeof query === "string" ? query.trim() : "";
});

// Updates SEO
useHead({
  title: computed(() =>
    searchQuery.value
      ? `${searchQuery.value} | Search | Purrify`
      : "Search | Purrify"
  ),

  meta: [
    {
      name: "description",
      content: computed(() =>
        searchQuery.value
          ? `Search results for ${searchQuery.value} on Purrify. Discover songs, albums and artists.`
          : "Search for songs, albums and artists on Purrify."
      ),
    },
  ],
});

// Searches Spotify Using the Query from the URL
const loadSearchResults = async () => {
  const requestId = ++searchRequestId;

  if (!searchQuery.value) {
    results.value = {
      tracks: [],
      albums: [],
      artists: [],
    };

    isLoading.value = false;
    loadError.value = "";
    openMenu.value = null;
    return;
  }

  try {
    isLoading.value = true;
    loadError.value = "";
    openMenu.value = null;

    const searchResults = await searchSpotify(searchQuery.value);

    if (requestId !== searchRequestId) return;

    results.value = searchResults;
  } catch (error) {
    if (requestId !== searchRequestId) return;

    console.error("Failed to search Spotify:", error);
    loadError.value = "We could not load your search results.";
  } finally {
    if (requestId === searchRequestId) {
      isLoading.value = false;
    }
  }
};

// Plays a New Track or Toggles the Current Track
const handleTrackClick = async (track: Track) => {
  const trackIndex = results.value.tracks.findIndex(
    (item) => item.id === track.id
  );

  if (trackIndex === -1) {
    return;
  }

  if (
    currentTrack.value?.id === track.id &&
    currentIndex.value === trackIndex
  ) {
    await togglePlay();
    return;
  }

  await playTracks(results.value.tracks, trackIndex);
};

// Opens or Closes a Track Menu
const toggleMenu = (index: number) => {
  openMenu.value = openMenu.value === index ? null : index;
};

// Runs a New Search Whenever the URL Query Changes
watch(searchQuery, loadSearchResults, {
  immediate: true,
});

// Invalidates Pending Searches When Leaving the Page
onBeforeUnmount(() => {
  searchRequestId++;
});

</script>