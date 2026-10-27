<template>
  <!-- Artist Page -->
  <main class="px-4 py-5 sm:px-6 sm:py-8" aria-labelledby="artist-heading">

    <!-- Loading Artist -->
    <div v-if="isLoading" class="flex min-h-125 items-center justify-center" role="status">
      <div class="text-center">
        <div class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary-light border-t-primary"
          aria-hidden="true"></div>

        <p class="mt-4 text-sm text-text-secondary">
          Loading artist...
        </p>
      </div>
    </div>

    <template v-else-if="artist">
      <!-- Artist Hero -->
      <section class="relative isolate h-70 overflow-hidden rounded-[28px] bg-secondary shadow-[0_14px_40px_rgba(75,75,85,0.16)]
        sm:h-80 lg:h-90">

        <!-- Blurred Background -->
        <img v-if="artist.image" :src="artist.image" alt="" aria-hidden="true"
          class="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
        />

        <!-- Full Artist Image -->
        <img v-if="artist.image" :src="artist.image" :alt="`${artist.name} artist photo`"
          fetchpriority="high" decoding="async"
          class="absolute inset-0 h-full w-full object-contain object-center"
        />

        <!-- Gradient Overlay -->
        <div class="absolute inset-0 bg-linear-to-r from-black/80 via-black/35 to-transparent"
          aria-hidden="true"></div>

        <!-- Artist Information -->
        <div class="absolute inset-x-0 bottom-0 p-5 sm:p-7 lg:p-8">
          <p class="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-white/80">
            Artist
          </p>

          <h1 id="artist-heading" class="text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            {{ artist.name }}
          </h1>

          <!-- Hero Actions -->
          <div class="mt-6 flex items-center gap-3">
            <button type="button" :disabled="!topTracks.length"
              class="btn-base btn-md flex cursor-pointer items-center gap-2 bg-primary text-white
              hover:scale-105 hover:bg-primary-hover"
              @click="playArtist">

              <img src="@/assets/icons/play-hover-icon.svg" alt="" aria-hidden="true" class="h-5 w-5"/>
              <span>Play</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Popular Songs -->
      <section class="section-card mt-6" aria-labelledby="popular-heading">

        <!-- Header -->
        <div class="section-card-header">
          <h2 id="popular-heading" class="section-card-title">
            Popular Songs
          </h2>

          <button v-if="topTracks.length > 5" type="button"
            class="btn-base btn-sm border border-primary bg-primary-pale text-primary hover:bg-primary-light"
            :aria-expanded="showAllTracks"
            @click="showAllTracks = !showAllTracks">
            {{ showAllTracks ? "Show less" : "See all" }}
          </button>
        </div>

        <!-- Popular Tracks -->
        <TrackList v-if="visibleTracks.length" :tracks="visibleTracks" list-label="Popular artist songs"
          heading-id="popular-heading" :show-header="false" :embedded="true"
          :current-track-id="currentTrack?.id" :current-track-index="currentIndex"
          :is-playing="isPlaying" :open-menu="openMenu" :is-favorite="isFavorite"
          @track-click="handleTrackClick" @favorite-click="handleFavoriteClick" @menu-click="toggleMenu"
        />

        <!-- Empty Tracks -->
        <p v-else class="py-8 text-center text-sm text-text-secondary">
          No popular songs available.
        </p>
      </section>

      <!-- Albums -->
      <AlbumSection class="mt-6" :albums="albums" title="Albums" heading-id="albums-heading"/>
    </template>

    <!-- Artist Not Found -->
    <div v-else class="flex min-h-125 items-center justify-center">
      <div class="text-center">
        <h1 id="artist-heading" class="text-xl font-semibold text-primary-text">
          Artist not found
        </h1>

        <p class="mt-2 text-sm text-text-secondary">
          {{ loadError || "This artist could not be found." }}
        </p>
      </div>
    </div>

    <!-- Action Toast -->
    <ActionToast :show="showToast" :type="toastType" :action="toastAction"
      :track-name="toastTrackName" :playlist-name="toastPlaylistName" @close="closeToast"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useHead } from "@unhead/vue";
import TrackList from "@/components/music/TrackList.vue";
import AlbumSection from "@/components/music/AlbumSection.vue";
import ActionToast from "@/components/ui/ActionToast.vue";
import { usePlayer } from "@/composables/usePlayer";
import { useFavoriteActions } from "@/composables/useFavoritesActions";
import { useActionToast } from "@/composables/useActionToast";
import { getArtist, getArtistTopTracks, getArtistAlbums, type ArtistDetails, type ArtistAlbum } from "@/services/spotify/api/artist";
import type { Track } from "@/types/music";

const route = useRoute();

const artist = ref<ArtistDetails | null>(null);
const topTracks = ref<Track[]>([]);
const albums = ref<ArtistAlbum[]>([]);

const isLoading = ref(true);
const loadError = ref("");

const showAllTracks = ref(false);
const openMenu = ref<number | null>(null);

let loadRequestId = 0;

const { currentTrack, currentIndex, isPlaying, playTracks, togglePlay } = usePlayer();
const { isFavorite, handleFavoriteClick } = useFavoriteActions();
const { showToast, toastType, toastAction, toastTrackName, toastPlaylistName, closeToast } = useActionToast();

// Displays the first five popular songs
const visibleTracks = computed(() =>
  showAllTracks.value ? topTracks.value : topTracks.value.slice(0, 5),
);

// Updates SEO
useHead({
  title: computed(() =>
    artist.value
      ? `${artist.value.name} | Purrify`
      : "Artist | Purrify"
  ),

  meta: [
    {
      name: "description",
      content: computed(() =>
        artist.value
          ? `Listen to popular songs and explore albums by ${artist.value.name} on Purrify.`
          : "Discover artists, popular songs, and albums on Purrify."
      ),
    },
  ],
});

// Plays the selected song
const handleTrackClick = async (track: Track, index: number) => {
  const realIndex = topTracks.value.findIndex((item) => item.id === track.id);

  try {
    if (currentTrack.value?.id === track.id) {
      await togglePlay();
      return;
    }

    await playTracks(topTracks.value, realIndex >= 0 ? realIndex : index);
  } catch (error) {
    console.error("Failed to play artist track:", error);
  }
};

// Plays all popular songs
const playArtist = async () => {
  if (!topTracks.value.length) return;

  try {
    await playTracks(topTracks.value, 0);
  } catch (error) {
    console.error("Failed to play artist songs:", error);
  }
};

// Opens or closes the track options menu
const toggleMenu = (index: number) => {
  openMenu.value = openMenu.value === index ? null : index;
};

// Loads artist information from Spotify
const loadArtist = async (artistId: string) => {
  const requestId = ++loadRequestId;

  isLoading.value = true;
  loadError.value = "";

  artist.value = null;
  topTracks.value = [];
  albums.value = [];

  showAllTracks.value = false;
  openMenu.value = null;

  if (!artistId) {
    loadError.value = "No artist ID was provided.";
    isLoading.value = false;
    return;
  }

  try {
    // Loads artist details first so the hero can appear independently
    const artistData = await getArtist(artistId);

    if (requestId !== loadRequestId) return;

    artist.value = artistData;

    // Loads popular songs and albums independently
    const [tracksResult, albumsResult] = await Promise.allSettled([
      getArtistTopTracks(artistId),
      getArtistAlbums(artistId),
    ]);

    if (requestId !== loadRequestId) return;

    if (tracksResult.status === "fulfilled") {
      topTracks.value = tracksResult.value;
    } else {
      console.error("Failed to load artist top tracks:", tracksResult.reason);
    }

    if (albumsResult.status === "fulfilled") {
      albums.value = albumsResult.value;
    } else {
      console.error("Failed to load artist albums:", albumsResult.reason);
    }
  } catch (error) {
    if (requestId !== loadRequestId) return;

    console.error("Failed to load artist:", error);

    loadError.value =
      error instanceof Error
        ? error.message
        : "Failed to load artist information.";
  } finally {
    if (requestId === loadRequestId) {
      isLoading.value = false;
    }
  }
};

// Reloads artist information when the route changes
watch(
  () => route.params.id,
  (artistId) => {
    void loadArtist(String(artistId ?? ""));
  },
  { immediate: true },
);

// Clears pending requests when leaving the page
onBeforeUnmount(() => {
  loadRequestId++;
});

</script>