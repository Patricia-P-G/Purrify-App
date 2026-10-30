<template>
  <header class="sticky top-0 z-30 flex min-h-20 w-full items-center gap-3 border-b border-border-pink bg-background px-4
    sm:gap-4 sm:px-6 lg:pl-8 lg:pr-16">

    <!-- Search -->
    <div ref="searchContainer" class="relative mx-auto min-w-0 flex-1 sm:max-w-xl lg:max-w-2xl">
      <SearchBar v-model="searchQuery" @submit="submitSearch" @clear="clearSearch" @focus="handleSearchFocus"/>

      <SearchDropdown v-if="showDropdown && searchQuery.trim()" :is-searching="isSearching" :top-artist="topArtist"
        :tracks="previewTracks" :current-track-id="currentTrack?.id" :is-playing="isPlaying"
        @artist-click="openArtist" @track-click="handlePreviewTrack" @see-all="submitSearch"
      />
    </div>

    <!-- Profile -->
    <ProfileDropdown :profile-image="profileImage" :profile-name="profileName"/>
  </header>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import ProfileDropdown from "@/components/layout/ProfileDropdown.vue";
import SearchBar from "@/components/ui/SearchBar.vue";
import SearchDropdown from "@/features/search/SearchDropdown.vue";
import { getSpotifyProfile } from "@/services/spotify/api/profileAvatar";
import type { Track } from "@/types/music";
import { usePlayer } from "@/composables/usePlayer";
import { useSearch } from "@/composables/useSearch";

const router = useRouter();
const route = useRoute();

const { currentTrack, isPlaying, playTracks, togglePlay } = usePlayer();
const { searchQuery, isSearching, previewTracks, topArtist, clearSearch: clearSearchResults } = useSearch();

// Dropdown State
const showDropdown = ref(false);
const searchContainer = ref<HTMLElement | null>(null);

// Profile State
const profileImage = ref("");
const profileName = ref("User");

// Opens the Dropdown When Searching
watch(searchQuery, (query) => {
  showDropdown.value = Boolean(query.trim());
});

// Opens an Artist Page
const openArtist = async (artistId: string) => {
  showDropdown.value = false;

  await router.push({
    name: "artist",
    params: { id: artistId },
  });
};

// Plays or Pauses a Preview Track
const handlePreviewTrack = async (track: Track) => {
  if (currentTrack.value?.id === track.id) {
    await togglePlay();
    return;
  }

  const index = previewTracks.value.findIndex((item) => item.id === track.id);

  if (index === -1) return;

  await playTracks(previewTracks.value, index);
};

// Opens the Full Search Page
const submitSearch = async () => {
  const query = searchQuery.value.trim();

  if (!query) return;

  showDropdown.value = false;

  await router.push({
    path: "/search",
    query: { q: query },
  });
};

// Clears the Search
const clearSearch = async () => {
  clearSearchResults();
  showDropdown.value = false;

  if (route.path === "/search") {
    await router.push("/search");
  }
};

// Opens the Dropdown When Search Receives Focus
const handleSearchFocus = () => {
  if (searchQuery.value.trim()) showDropdown.value = true;
};

// Closes the Dropdown When Clicking Outside
const handleOutsideClick = (event: MouseEvent) => {
  if (searchContainer.value && !searchContainer.value.contains(event.target as Node)) {
    showDropdown.value = false;
  }
};

// Synchronizes the Search with the URL
watch(
  () => route.query.q,
  (query) => {
    if (route.path === "/search") {
      searchQuery.value = typeof query === "string" ? query : "";
    }
  },
  { immediate: true }
);

// Loads the Spotify Profile
onMounted(async () => {
  document.addEventListener("click", handleOutsideClick);

  try {
    const profile = await getSpotifyProfile();

    profileImage.value = profile.images?.at(-1)?.url ?? "";
    profileName.value = profile.display_name ?? "User";
  } catch (error) {
    console.error("Failed to load Spotify profile:", error);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleOutsideClick);
});

</script>