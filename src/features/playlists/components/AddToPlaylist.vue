<template>
  <!-- Backdrop -->
  <div class="fixed inset-0 z-200 flex items-center justify-center bg-black/30 px-3 py-4 sm:px-4 sm:py-6" @click.self="closeModal">

    <!-- Modal -->
    <section class="max-h-[calc(100dvh-2rem)] w-full max-w-120 overflow-y-auto rounded-[22px] bg-surface p-4 shadow-[0_24px_70px_rgba(75,75,85,0.22)] sm:max-h-[calc(100dvh-3rem)] sm:rounded-[28px] sm:p-6"
      role="dialog" aria-modal="true" aria-labelledby="add-playlist-title">

      <!-- Header -->
      <header class="flex items-center justify-between gap-4">
        <!-- Title -->
        <h2 id="add-playlist-title" class="text-xl font-semibold text-primary-text sm:text-2xl">
          Add to playlist
        </h2>

        <!-- Close -->
        <button type="button"
          class="group/close flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-text-muted transition duration-200 hover:bg-primary-light hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-90 motion-reduce:transform-none motion-reduce:transition-none"
          aria-label="Close add to playlist" @click="closeModal">
          <img src="@/assets/icons/close.svg" alt="" aria-hidden="true"
            class="block h-5 w-5 group-hover/close:hidden"/>
          <img src="@/assets/icons/close-hover.svg" alt="" aria-hidden="true"
            class="hidden h-5 w-5 group-hover/close:block"/>
        </button>
      </header>

      <!-- Selected Track -->
      <div class="mt-5 flex min-w-0 items-center gap-3 rounded-2xl bg-primary-pale p-3 sm:gap-4">
        <img v-if="track.image" :src="track.image" :alt="`${track.title} album cover`"
          class="h-14 w-14 shrink-0 rounded-xl object-cover shadow-sm sm:h-16 sm:w-16"/>

        <div v-else class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-light sm:h-16 sm:w-16"
          aria-hidden="true">
          <img src="@/assets/icons/music.svg" alt="" class="h-6 w-6"/>
        </div>

        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-primary-text">
            {{ track.title }}
          </p>

          <p class="mt-1 truncate text-xs text-text-muted">
            {{ track.artist }}
            <template v-if="track.album">· {{ track.album }}</template>
          </p>
        </div>

        <span v-if="track.duration !== undefined" class="shrink-0 text-xs text-text-muted"
          :aria-label="formatDurationAccessible(track.duration)">
          {{ formatDuration(track.duration) }}
        </span>
      </div>

      <!-- Choose Playlist -->
      <div class="mt-6">
        <p class="text-sm font-medium text-text-secondary">
          Choose a playlist
        </p>

        <!-- Playlists -->
        <div v-if="playlists.length > 0"
          class="playlist-scrollbar mt-3 max-h-65 space-y-1 overflow-y-auto pr-2"
          role="radiogroup" aria-label="Choose a playlist">

          <button v-for="playlist in playlists" :key="playlist.id" type="button" role="radio"
            :aria-checked="selectedPlaylistId === playlist.id"
            class="group flex w-full cursor-pointer items-center gap-3 rounded-2xl p-2.5 text-left transition duration-200 hover:bg-primary-pale focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.99] motion-reduce:transform-none motion-reduce:transition-none"
            :class="selectedPlaylistId === playlist.id ? 'bg-primary-pale' : ''"
            @click="selectedPlaylistId = playlist.id; clearError()">

            <img v-if="playlist.cover" :src="playlist.cover" :alt="`${playlist.name} playlist cover`"
              class="h-11 w-11 shrink-0 rounded-lg object-cover"/>

            <div v-else class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-light" aria-hidden="true">
              <img src="@/assets/icons/music.svg" alt="" class="h-5 w-5"/>
            </div>

            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-primary-text transition duration-200 group-hover:text-primary">
                {{ playlist.name }}
              </p>

              <p class="mt-0.5 text-xs text-text-muted">
                {{ playlist.tracks.length }}
                {{ playlist.tracks.length === 1 ? "song" : "songs" }}
              </p>
            </div>

            <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition duration-200"
              :class="selectedPlaylistId === playlist.id ? 'border-primary' : 'border-border'"
              aria-hidden="true">
              <span v-if="selectedPlaylistId === playlist.id"
                class="h-2.5 w-2.5 rounded-full bg-primary"></span>
            </span>
          </button>
        </div>

        <!-- Empty State -->
        <div v-else class="mt-3 rounded-2xl border border-primary-light bg-primary-pale px-5 py-6 text-center">
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-light"
            aria-hidden="true">
            <img src="@/assets/icons/music.svg" alt="" class="h-6 w-6"/>
          </div>

          <p class="mt-3 text-sm font-semibold text-primary-text">
            No playlists yet
          </p>

          <p class="mx-auto mt-1 max-w-70 text-xs leading-5 text-text-muted">
            Create your first playlist to start saving your favorite songs.
          </p>
        </div>

        <!-- New Playlist -->
        <button type="button"
          class="mt-3 flex w-full cursor-pointer items-center gap-3 rounded-2xl p-2.5 text-left transition duration-200 hover:bg-primary-pale focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.99] motion-reduce:transform-none motion-reduce:transition-none"
          @click="openNewPlaylist">

          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-light text-2xl font-light text-primary"
            aria-hidden="true">
            +
          </span>

          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-primary-text">
              New Playlist
            </p>

            <p class="mt-0.5 text-xs text-text-muted">
              Create a new playlist
            </p>
          </div>
        </button>
      </div>

      <!-- Error Message -->
      <p v-if="errorMessage" role="alert" class="mt-4 text-sm text-red-600">
        {{ errorMessage }}
      </p>

      <!-- Actions -->
      <footer class="mt-6 flex w-full gap-3 sm:mt-7 sm:justify-end">
        <!-- Cancel -->
        <button type="button" class="flex-1 cursor-pointer rounded-xl border border-border bg-surface px-4 py-2.5 text-sm
         font-semibold text-primary-text transition duration-200 hover:bg-surface-light focus-visible:outline-2
         focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95 motion-reduce:transform-none
         motion-reduce:transition-none sm:min-w-30 sm:flex-none sm:px-6" @click="closeModal">
          Cancel
        </button>

        <!-- Add -->
        <button type="button" class="flex-1 cursor-pointer rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white
         transition duration-200 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2
         focus-visible:outline-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transform-none
         motion-reduce:transition-none sm:min-w-30 sm:flex-none sm:px-6" :disabled="!selectedPlaylistId || isSaving" @click="addToPlaylist">
          Add
        </button>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { usePlaylists } from "@/composables/usePlaylists";
import { useActionToast } from "@/composables/useActionToast";
import { useActionError } from "@/composables/useActionError";
import type { Track } from "@/types/music";
import { formatDuration, formatDurationAccessible } from "@/utils/format";

const props = defineProps<{
  track: Track;
}>();

const emit = defineEmits<{
  close: [];
  newPlaylist: [track: Track];
}>();

const { playlists, addTrackToPlaylist } = usePlaylists();
const { triggerToast } = useActionToast();
const { errorMessage, isSaving, clearError, runAction } = useActionError();

const selectedPlaylistId = ref<string | null>(null);

// Closes the modal
const closeModal = () => {
  emit("close");
};

// Opens Create Playlist
const openNewPlaylist = () => {
  emit("newPlaylist", props.track);
};

// Adds the track to the selected playlist
const addToPlaylist = async () => {
  if (!selectedPlaylistId.value || isSaving.value) return;

  const playlist = playlists.value.find(
    (playlist) => playlist.id === selectedPlaylistId.value
  );

  if (!playlist) {
    errorMessage.value = "Playlist could not be found.";
    return;
  }

  const added = await runAction(() =>
    addTrackToPlaylist(playlist.id, props.track)
  );

  if (!added) return;

  triggerToast({
    type: "track",
    action: "added",
    trackName: props.track.title,
    playlistName: playlist.name,
  });

  closeModal();
};

</script>

<style scoped>
.playlist-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.playlist-scrollbar::-webkit-scrollbar {
  width: 5px;
}

.playlist-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.playlist-scrollbar::-webkit-scrollbar-thumb {
  border-radius: 9999px;
  background: var(--color-border);
}

.playlist-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
}

</style>