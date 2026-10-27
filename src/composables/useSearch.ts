import { onBeforeUnmount, ref, watch } from "vue";
import { searchSpotify, type SearchArtist } from "@/services/spotify/api/search";
import type { Track } from "@/types/music";

// Responsible only for the Spotify search state + debounce + preview results
export const useSearch = () => {
  const searchQuery = ref("");
  const isSearching = ref(false);
  const previewTracks = ref<Track[]>([]);
  const topArtist = ref<SearchArtist | null>(null);

  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  // Clears the search preview results
  const clearResults = () => {
    previewTracks.value = [];
    topArtist.value = null;
  };

  // Loads preview results from Spotify
  const loadPreviewResults = async (query: string) => {
    isSearching.value = true;

    try {
      const data = await searchSpotify(query);

      // Ignores results from an outdated search
      if (query !== searchQuery.value.trim()) return;

      previewTracks.value = data.tracks.slice(0, 3);
      topArtist.value = data.artists[0] ?? null;
    } catch (error) {
      console.error("Failed to load search preview:", error);

      if (query === searchQuery.value.trim()) {
        clearResults();
      }
    } finally {
      if (query === searchQuery.value.trim()) {
        isSearching.value = false;
      }
    }
  };

  // Searches after the user stops typing
  watch(searchQuery, (newQuery) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const query = newQuery.trim();

    if (!query) {
      clearResults();
      isSearching.value = false;
      return;
    }

    searchTimeout = setTimeout(() => {
      loadPreviewResults(query);
    }, 350);
  });

  // Clears the search
  const clearSearch = () => {
    searchQuery.value = "";
    clearResults();
    isSearching.value = false;
  };

  // Cleans up the debounce timer
  onBeforeUnmount(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
  });

  return {
    searchQuery,
    isSearching,
    previewTracks,
    topArtist,
    clearSearch,
  };
};