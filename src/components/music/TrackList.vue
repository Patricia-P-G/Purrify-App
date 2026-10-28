<template>
  <!-- List of Songs -->
  <section class="overflow-visible"
    :class="embedded ? '' : 'rounded-[22px] border border-border bg-surface shadow-[0_14px_40px_rgba(75,75,85,0.12)] sm:rounded-[28px]'"
    :aria-labelledby="headingId">

    <h2 :id="headingId" class="sr-only">
      {{ listLabel }}
    </h2>

    <!-- Table Header -->
    <div v-if="showHeader" class="hidden grid-cols-[60px_minmax(0,1fr)_220px_130px_60px] items-center border-b border-border px-6
      py-4 text-sm font-medium text-text-secondary lg:grid" aria-hidden="true">

      <span class="flex h-9 w-9 items-center justify-center">#</span>
      <span class="pl-2">Song</span>
      <span>Album</span>

      <!-- Time Icon -->
      <span class="flex h-5 w-5 items-center justify-center">
        <img src="@/assets/icons/time.svg" alt="" aria-hidden="true" class="h-5 w-5"/>
      </span>

      <span></span>
    </div>

    <!-- Tracks -->
    <ul :aria-label="listLabel" :class="recentHover ? 'flex flex-col gap-2' : ''">

      <!-- Track Row -->
      <li v-for="(track, index) in tracks" :key="`${track.id}-${index}`"
        class="group relative grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2
        sm:gap-3 lg:grid-cols-[60px_minmax(0,1fr)_220px_130px_60px] lg:gap-0"
        :class="[
          recentHover
            ? 'song-card p-2.5'
            : 'border-b border-border py-3 transition duration-200 last:rounded-b-[22px] last:border-b-0 sm:last:rounded-b-[28px]',
          recentHover
            ? isCurrentTrack(track.id, index) ? 'song-card-active' : ''
            : isCurrentTrack(track.id, index)
              ? 'bg-primary-light shadow-[0_8px_22px_rgba(253,113,121,0.16)]'
              : 'hover:bg-surface-light hover:shadow-[0_8px_24px_rgba(75,75,85,0.10)]',
          openMenu === index ? 'z-50' : 'z-0',
          recentHover ? '' : embedded ? 'px-6' : 'px-3 sm:px-5 lg:px-6'
        ]">

        <!-- Number / Play Button -->
        <div class="hidden h-9 w-9 items-center justify-center lg:flex">

          <!-- Track Number -->
          <span v-if="!isCurrentTrack(track.id, index)"
            class="text-sm text-text-secondary transition duration-200 group-hover:hidden motion-reduce:transition-none"
            aria-hidden="true">
            {{ index + 1 }}
          </span>

          <!-- Play / Pause Button -->
          <button type="button"
            class="cursor-pointer transition duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
            active:scale-90 motion-reduce:transform-none motion-reduce:transition-none"
            :class="isCurrentTrack(track.id, index) ? 'block' : 'hidden group-hover:block focus-visible:block'"
            :aria-label="isCurrentTrack(track.id, index) && isPlaying ? `Pause ${track.title} by ${track.artist}` : `Play ${track.title} by ${track.artist}`"
            :aria-pressed="isCurrentTrack(track.id, index) && isPlaying"
            @click="emit('trackClick', track, index)">

            <PlayButton :active="isCurrentTrack(track.id, index)"
              :playing="isCurrentTrack(track.id, index) && isPlaying"/>
          </button>
        </div>

        <!-- Track Information -->
        <div class="flex min-w-0 items-center gap-3 sm:gap-4">

          <!-- Album Cover -->
          <img v-if="track.image" :src="track.image" alt="" loading="lazy" decoding="async" width="56" height="56"
            class="h-12 w-12 shrink-0 object-cover transition duration-200 motion-reduce:transition-none sm:h-14 sm:w-14"
            :class="recentHover
              ? 'rounded-2xl shadow-[0_4px_10px_rgba(75,75,85,0.16)] group-hover:shadow-[0_6px_14px_rgba(75,75,85,0.22)]'
              : 'rounded-lg shadow-sm group-hover:shadow-[0_6px_16px_rgba(75,75,85,0.22)] sm:rounded-xl'"/>

          <!-- Album Cover Fallback -->
          <div v-else
            class="flex h-12 w-12 shrink-0 items-center justify-center bg-primary-light text-primary sm:h-14 sm:w-14"
            :class="recentHover ? 'rounded-2xl' : 'rounded-lg sm:rounded-xl'"
            aria-hidden="true">
            <img src="@/assets/icons/music.svg" alt="" class="h-5 w-5 sm:h-6 sm:w-6"/>
          </div>

          <!-- Song Information -->
          <div class="min-w-0 flex-1">

            <!-- Song Title -->
            <h3 class="truncate text-sm font-semibold transition duration-200 motion-reduce:transition-none"
              :class="isCurrentTrack(track.id, index) ? 'text-primary' : 'text-primary-text'">
              {{ track.title }}
            </h3>

            <!-- Artists -->
            <p class="mt-0.5 truncate text-xs text-text-secondary">

              <!-- Multiple Artists -->
              <template v-if="track.artists?.length">
                <template v-for="(artist, artistIndex) in track.artists" :key="artist.id || artistIndex">
                  <span v-if="artistIndex > 0">, </span>

                  <!-- Artist Link -->
                  <RouterLink v-if="artist.id"
                    :to="{ name: 'artist', params: { id: artist.id } }"
                    :aria-label="`View ${artist.name} artist page`"
                    class="inline-block cursor-pointer align-baseline text-text-secondary
                    hover:text-text-secondary hover:underline hover:underline-offset-2
                    focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2
                    focus-visible:outline-primary">
                    {{ artist.name }}
                  </RouterLink>

                  <!-- Artist Without ID -->
                  <span v-else class="inline-block">{{ artist.name }}</span>
                </template>
              </template>

              <!-- Single Artist Fallback -->
              <RouterLink v-else-if="track.artistId"
                :to="{ name: 'artist', params: { id: track.artistId } }"
                :aria-label="`View ${track.artist} artist page`"
                class="inline-block cursor-pointer align-baseline text-text-secondary
                hover:text-text-secondary hover:underline hover:underline-offset-2
                focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2
                focus-visible:outline-primary">
                {{ track.artist }}
              </RouterLink>

              <!-- Artist Without ID -->
              <span v-else>{{ track.artist }}</span>
            </p>
          </div>
        </div>

        <!-- Album Name -->
        <div class="hidden min-w-0 overflow-hidden pr-4 text-sm text-text-secondary lg:block">
          <RouterLink v-if="track.albumId" :to="{ name: 'album', params: { id: track.albumId } }"
            class="inline-block max-w-full truncate align-middle hover:underline hover:underline-offset-2
            focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            :title="track.album">
            {{ track.album }}
          </RouterLink>

          <span v-else class="block truncate" :title="track.album">
            {{ track.album }}
          </span>
        </div>

        <!-- Duration and Favorite -->
        <div class="flex min-w-0 items-center justify-center text-sm text-text-secondary lg:w-full lg:justify-between">

          <!-- Duration -->
          <span class="hidden shrink-0 whitespace-nowrap lg:inline">
            <span class="sr-only">
              Duration:
            </span>

            <span aria-hidden="true">
              {{ formatDuration(track.duration) }}
            </span>

            <span class="sr-only">
              {{ formatDurationAccessible(track.duration) }}
            </span>
          </span>

          <!-- Favorite Button -->
          <button type="button"
            :aria-label="isFavorite(track.id) ? `Remove ${track.title} from favorites` : `Add ${track.title} to favorites`"
            :aria-pressed="isFavorite(track.id)"
            class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center transition duration-200 hover:scale-110
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95
            motion-reduce:transform-none motion-reduce:transition-none lg:mr-2"
            @click="emit('favoriteClick', track)">

            <img v-if="isFavorite(track.id)" src="@/assets/icons/favorites-hover.svg"
              alt="" aria-hidden="true" class="h-5 w-5"/>

            <img v-else src="@/assets/icons/favorites.svg"
              alt="" aria-hidden="true" class="h-5 w-5"/>
          </button>
        </div>

        <!-- Track Actions -->
        <TrackActionsMenu :track="track" :index="index" :is-open="openMenu === index"
          :allow-remove="allowRemoveFromPlaylist"
          @toggle="emit('menuClick', index)"
          @add-to-playlist="openAddToPlaylist(track, index)"
          @create-playlist="handleCreatePlaylist(track, index)"
          @remove="handleRemoveFromPlaylist(track, index)"/>
      </li>
    </ul>

    <slot name="loading"></slot>

    <!-- Empty State -->
    <div v-if="tracks.length === 0" class="px-6 py-12 text-center text-sm text-text-secondary"
      role="status" aria-live="polite">
      No songs found.
    </div>
  </section>

  <!-- Add to Playlist -->
  <AddToPlaylist v-if="selectedTrackForPlaylist" :track="selectedTrackForPlaylist"
    @close="closeAddToPlaylist" @new-playlist="handleNewPlaylist"/>

  <!-- Create Playlist -->
  <CreatePlaylist v-if="selectedTrackForCreatePlaylist" :track="selectedTrackForCreatePlaylist"
    @close="closeCreatePlaylist"/>

  <!-- Action Toast -->
  <ActionToast :show="showToast" :type="toastType" :action="toastAction"
    :track-name="toastTrackName" :playlist-name="toastPlaylistName" @close="closeToast"/>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";
import PlayButton from "@/components/music/PlayButton.vue";
import TrackActionsMenu from "@/components/music/TrackActionsMenu.vue";
import ActionToast from "@/components/ui/ActionToast.vue";
import { useActionToast } from "@/composables/useActionToast";
import type { Track } from "@/types/music";
import { formatDuration, formatDurationAccessible } from "@/utils/format";

// Lazy Loaded Playlist Components
const AddToPlaylist = defineAsyncComponent(
  () => import("@/features/playlists/components/AddToPlaylist.vue"),
);

const CreatePlaylist = defineAsyncComponent(
  () => import("@/features/playlists/components/CreatePlaylist.vue"),
);

// Component Props
const props = withDefaults(
  defineProps<{
    tracks: Track[];
    showHeader?: boolean;
    embedded?: boolean;
    recentHover?: boolean;
    listLabel: string;
    headingId?: string;
    currentTrackId?: string;
    currentTrackIndex?: number;
    isPlaying: boolean;
    openMenu: number | null;
    isFavorite: (trackId: string) => boolean;
    allowRemoveFromPlaylist?: boolean;
  }>(),
  {
    headingId: "track-list-heading",
    currentTrackIndex: -1,
    showHeader: true,
    embedded: false,
    recentHover: false,
    allowRemoveFromPlaylist: false,
  },
);

// Component Events
const emit = defineEmits<{
  trackClick: [track: Track, index: number];
  favoriteClick: [track: Track];
  menuClick: [index: number];
  removeFromPlaylist: [track: Track];
}>();

// Action Toast
const { showToast, toastType, toastAction, toastTrackName, toastPlaylistName, closeToast } = useActionToast();

// Playlist State
const selectedTrackForPlaylist = ref<Track | null>(null);
const selectedTrackForCreatePlaylist = ref<Track | null>(null);

// Checks Whether a Track Is Selected
const isCurrentTrack = (trackId: string, index: number) => {
  return props.currentTrackId === trackId && props.currentTrackIndex === index;
};

// Opens Add to Playlist
const openAddToPlaylist = (track: Track, index: number) => {
  emit("menuClick", index);
  selectedTrackForPlaylist.value = track;
};

// Closes Add to Playlist
const closeAddToPlaylist = () => {
  selectedTrackForPlaylist.value = null;
};

// Opens Create Playlist
const handleCreatePlaylist = (track: Track, index: number) => {
  emit("menuClick", index);
  selectedTrackForCreatePlaylist.value = track;
};

// Creates a New Playlist
const handleNewPlaylist = (track: Track) => {
  closeAddToPlaylist();
  selectedTrackForCreatePlaylist.value = track;
};

// Closes Create Playlist
const closeCreatePlaylist = () => {
  selectedTrackForCreatePlaylist.value = null;
};

// Removes a Track from Playlist
const handleRemoveFromPlaylist = (track: Track, index: number) => {
  emit("menuClick", index);
  emit("removeFromPlaylist", track);
};

</script>