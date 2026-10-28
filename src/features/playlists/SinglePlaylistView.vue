<template>
  <!-- Playlist -->
  <main v-if="playlist" class="px-4 py-5 sm:px-6 sm:py-8" aria-labelledby="playlist-heading">
    <!-- Hero -->
    <MusicHeroLayout heading-id="playlist-heading" label="Playlist" :title="playlist.name"
      :description="playlist.description || 'Your songs, all in one place.'"
      :image="playlist.cover || undefined" :song-count="playlist.tracks.length">
      <template #actions>
        <div class="flex w-[85%] items-center gap-3 self-center sm:w-auto sm:self-auto">
          <PlayAllButton v-if="!tracksUnavailable" class="min-w-0 flex-1 sm:flex-none"
            :disabled="playlist.tracks.length === 0" @click="playAll"/>

          <PlaylistOptionsMenu v-if="!isSpotifyPlaylist"
            @edit="showEditPlaylist = true" @delete="openDeletePlaylist"/>
        </div>
      </template>
    </MusicHeroLayout>

    <!-- Restricted Spotify Playlist -->
    <div v-if="tracksUnavailable" role="status"
      class="rounded-2xl border border-border-pink bg-white px-5 py-6 text-center">
      <h2 class="text-lg font-semibold text-primary-text">
        Songs unavailable
      </h2>

      <p class="mt-2 text-sm text-text-secondary">
        Spotify doesn't allow this app to access the songs in this playlist.
      </p>
    </div>

    <!-- Track List -->
    <TrackList v-else :tracks="visibleTracks" list-label="Playlist songs" heading-id="playlist-songs-heading" :current-track-id="currentTrack?.id"
      :current-track-index="currentIndex" :is-playing="isPlaying" :open-menu="openMenu" :is-favorite="isFavorite"
      :allow-remove-from-playlist="!isSpotifyPlaylist" @track-click="handleTrackClick" @favorite-click="handleFavoriteClick"
      @menu-click="toggleMenu" @remove-from-playlist="handleRemoveTrack">

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

    <!-- Edit Playlist -->
    <EditPlaylist v-if="showEditPlaylist && localPlaylist" :playlist="localPlaylist"
      @close="showEditPlaylist = false" @saved="handlePlaylistEdited"/>
  </main>

  <!-- Loading Playlist -->
  <main v-else-if="isLoadingPlaylist" class="px-4 py-5 sm:px-6 sm:py-8">
    <div class="flex min-h-125 items-center justify-center rounded-4xl bg-white px-4">
      <div class="text-center" role="status" aria-live="polite">
        <div
          class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary-light border-t-primary"
          aria-hidden="true"></div>

        <p class="mt-4 text-sm text-text-muted">
          Loading playlist...
        </p>
      </div>
    </div>
  </main>

  <!-- Playlist Not Found -->
  <main v-else class="px-4 py-5 sm:px-6 sm:py-8">
    <div class="flex min-h-125 items-center justify-center rounded-4xl bg-white px-6 py-12">
      <div class="text-center">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-light"
          aria-hidden="true">
          <img src="@/assets/icons/music.svg" alt="" class="h-8 w-8"/>
        </div>

        <h1 class="mt-5 text-2xl font-semibold text-primary-text">
          Playlist not found
        </h1>

        <button type="button"
          class="mt-5 cursor-pointer rounded-full bg-primary px-6 py-2.5 font-semibold text-white
          transition duration-200 hover:bg-primary-hover
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          @click="router.push('/playlists')">
          Back to Playlists
        </button>
      </div>
    </div>
  </main>

  <!-- Delete Playlist -->
  <DeletePlaylist v-if="showDeleteConfirmation && deletingPlaylistId"
    :playlist-id="deletingPlaylistId" :playlist-name="deletingPlaylistName"
    @close="closeDeletePlaylist" @deleted="handleDeletePlaylist"/>

  <!-- Action Toast -->
  <ActionToast :show="showToast" :type="toastType" :action="toastAction"
    :track-name="toastTrackName" :playlist-name="toastPlaylistName"
    @close="closeToast"/>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useHead } from "@unhead/vue";
import MusicHeroLayout from "@/components/music/MusicHeroLayout.vue";
import TrackList from "@/components/music/TrackList.vue";
import PlayAllButton from "@/components/ui/PlayAllButton.vue";
import ActionToast from "@/components/ui/ActionToast.vue";
import EditPlaylist from "@/features/playlists/components/EditPlaylist.vue";
import PlaylistOptionsMenu from "@/features/playlists/components/PlaylistOptionsMenu.vue";
import DeletePlaylist from "./components/DeletePlaylist.vue";
import { useFavoriteActions } from "@/composables/useFavoritesActions";
import { usePlaylists } from "@/composables/usePlaylists";
import { usePlayer } from "@/composables/usePlayer";
import { useActionToast } from "@/composables/useActionToast";
import { useInfiniteScroll } from "@/composables/useInfiniteScroll";
import { getSpotifyPlaylist, getSpotifyPlaylistTracks, type SpotifyPlaylistDetails } from "@/services/spotify/api/spotifyPlaylist";
import type { Track } from "@/types/music";

const route = useRoute();
const router = useRouter();
const playlistId = computed(() => route.params.id as string);

// Playlists
const { playlists, loadPlaylists, removeTrackFromPlaylist } = usePlaylists();

const localPlaylist = computed(() =>
  playlists.value.find((item) => item.id === playlistId.value)
);

const spotifyPlaylist = ref<SpotifyPlaylistDetails | null>(null);
const isSpotifyPlaylist = ref(false);
const isLoadingPlaylist = ref(false);

const playlist = computed(() =>
  localPlaylist.value ?? spotifyPlaylist.value
);

// Infinite Scroll
const visibleCount = ref(10);

const tracksUnavailable = computed(() =>
  isSpotifyPlaylist.value &&
  spotifyPlaylist.value?.tracksUnavailable === true
);

const visibleTracks = computed(() => {
  if (!playlist.value) return [];

  return isSpotifyPlaylist.value
    ? playlist.value.tracks
    : playlist.value.tracks.slice(0, visibleCount.value);
});

const hasMore = computed(() => {
  if (!playlist.value || tracksUnavailable.value || isLoadingPlaylist.value) {
    return false;
  }

  return isSpotifyPlaylist.value
    ? spotifyPlaylist.value?.hasMore === true
    : visibleCount.value < playlist.value.tracks.length;
});

// Player
const { currentTrack, currentIndex, isPlaying, playTracks } = usePlayer();

// Favorites
const { isFavorite, handleFavoriteClick } = useFavoriteActions();

// Action Toast
const { showToast, toastType, toastAction, toastTrackName, toastPlaylistName, triggerToast, closeToast } = useActionToast();

// Track Menu
const openMenu = ref<number | null>(null);

// Playlist Dialogs
const showEditPlaylist = ref(false);
const showDeleteConfirmation = ref(false);

const deletingPlaylistId = ref("");
const deletingPlaylistName = ref("");

// Prevents Old Requests From Updating a New Playlist
let loadRequestId = 0;

// Reusable Infinite Scroll
const { loadMoreTrigger, isLoadingMore, loadingAnnouncement, reset } = useInfiniteScroll(hasMore, async () => {
  if (isSpotifyPlaylist.value && spotifyPlaylist.value) {
    const requestId = loadRequestId;
    const currentPlaylistId = playlistId.value;
    const currentOffset = spotifyPlaylist.value.nextOffset;

    // Loads the Next 10 Spotify Songs
    const nextPage = await getSpotifyPlaylistTracks(
      currentPlaylistId,
      currentOffset
    );

    if (requestId !== loadRequestId) return;

    spotifyPlaylist.value = {
      ...spotifyPlaylist.value,
      tracks: [...spotifyPlaylist.value.tracks, ...nextPage.tracks],
      hasMore: nextPage.hasMore,
      nextOffset: nextPage.nextOffset,
    };
  } else {
    // Displays the Next 10 Playlist Songs
    visibleCount.value = Math.min(
      visibleCount.value + 10,
      localPlaylist.value?.tracks.length ?? 0
    );
  }
});

// Updates SEO
useHead({
  title: computed(() =>
    playlist.value
      ? `${playlist.value.name} | Purrify`
      : "Playlist | Purrify"
  ),

  meta: [
    {
      name: "description",
      content: computed(() =>
        playlist.value
          ? `Listen to ${playlist.value.name} and explore its songs on Purrify.`
          : "Listen to your playlists and favorite songs on Purrify."
      ),
    },
  ],
});

// Loads Playlist
const loadPlaylist = async () => {
  const requestId = ++loadRequestId;

  spotifyPlaylist.value = null;
  isSpotifyPlaylist.value = false;
  visibleCount.value = 10;
  isLoadingPlaylist.value = true;
  reset();

  try {
    // Load Playlists From Appwrite
    await loadPlaylists();

    if (requestId !== loadRequestId) return;

    if (localPlaylist.value) {
      return;
    }

    // Load Spotify Playlist
    const result = await getSpotifyPlaylist(playlistId.value);

    if (requestId !== loadRequestId) return;

    spotifyPlaylist.value = result;
    isSpotifyPlaylist.value = true;
  } catch (error) {
    if (requestId !== loadRequestId) return;

    console.error("Failed to load playlist:", error);
    spotifyPlaylist.value = null;
  } finally {
    if (requestId === loadRequestId) {
      isLoadingPlaylist.value = false;
    }
  }
};

// Plays All Playlist Songs
const playAll = async () => {
  if (!playlist.value || playlist.value.tracks.length === 0) return;

  try {
    await playTracks(playlist.value.tracks, 0);
  } catch (error) {
    console.error("Failed to play playlist:", error);
  }
};

// Plays Selected Song
const handleTrackClick = async (_track: Track, index: number) => {
  if (!playlist.value) return;

  try {
    await playTracks(playlist.value.tracks, index);
  } catch (error) {
    console.error("Failed to play track:", error);
  }
};

// Toggles Track Menu
const toggleMenu = (index: number) => {
  openMenu.value = openMenu.value === index ? null : index;
};

// Removes Track From Playlist
const handleRemoveTrack = async (track: Track) => {
  if (isSpotifyPlaylist.value || !localPlaylist.value) return;

  const currentPlaylist = localPlaylist.value;
  const playlistName = currentPlaylist.name;

  try {
    const removed = await removeTrackFromPlaylist(
      currentPlaylist.id,
      track.id
    );

    if (!removed) {
      console.error("Track could not be removed from playlist.");
      return;
    }

    openMenu.value = null;

    triggerToast({
      type: "track",
      action: "removed",
      trackName: track.title,
      playlistName,
    });
  } catch (error) {
    console.error("Failed to remove track:", error);
  }
};

// Edits Playlist
const handlePlaylistEdited = (playlistName: string) => {
  triggerToast({
    type: "playlist",
    action: "updated",
    playlistName,
  });
};

// Opens Delete Playlist
const openDeletePlaylist = () => {
  if (!localPlaylist.value) return;

  deletingPlaylistId.value = localPlaylist.value.id;
  deletingPlaylistName.value = localPlaylist.value.name;
  showDeleteConfirmation.value = true;
};

// Closes Delete Playlist
const closeDeletePlaylist = () => {
  showDeleteConfirmation.value = false;
  deletingPlaylistId.value = "";
  deletingPlaylistName.value = "";
};

// Deletes Playlist
const handleDeletePlaylist = async (playlistName: string) => {
  closeDeletePlaylist();

  try {
    await router.push("/playlists");

    triggerToast({
      type: "playlist",
      action: "deleted",
      playlistName,
    });
  } catch (error) {
    console.error("Failed to navigate after deleting playlist:", error);
  }
};

// Reloads When Playlist Changes
watch(
  playlistId,
  () => {
    showEditPlaylist.value = false;
    closeDeletePlaylist();
    openMenu.value = null;

    void loadPlaylist();
  },
  { immediate: true }
);

</script>