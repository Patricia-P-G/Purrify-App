<template>
  <!-- Backdrop -->
  <div class="fixed inset-0 z-200 flex items-center justify-center bg-black/30 px-3 py-4 sm:px-4 sm:py-6" @click.self="closeModal">
    <!-- Modal -->
    <section class="max-h-[calc(100dvh-2rem)] w-full max-w-140 overflow-y-auto rounded-[22px] bg-surface p-4 shadow-[0_24px_70px_rgba(75,75,85,0.22)] sm:max-h-[calc(100dvh-3rem)] sm:rounded-[28px] sm:p-6"
      role="dialog" aria-modal="true" aria-labelledby="create-playlist-title">
      <!-- Header -->
      <header class="flex items-center justify-between gap-4">
        <!-- Title -->
        <h2 id="create-playlist-title" class="text-xl font-semibold text-primary-text sm:text-2xl">
          Create a playlist
        </h2>

        <!-- Close -->
        <button type="button" class="group/close flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full
         text-text-muted transition duration-200 hover:bg-primary-light hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-90 motion-reduce:transform-none motion-reduce:transition-none"
         aria-label="Close create playlist" @click="closeModal">

          <img src="@/assets/icons/close.svg" alt="" aria-hidden="true" class="block h-5 w-5 group-hover/close:hidden"/>
          <img src="@/assets/icons/close-hover.svg" alt="" aria-hidden="true" class="hidden h-5 w-5 group-hover/close:block"/>
        </button>
      </header>

      <!-- Playlist Cover -->
      <div class="mt-5 flex items-center gap-4 sm:mt-6 sm:gap-5">
        <div class="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary-light sm:h-28 sm:w-28">
          <img v-if="coverPreview" :src="coverPreview" alt="Playlist cover preview" class="h-full w-full object-cover"/>

          <div v-else class="flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow-sm" aria-hidden="true">
            <img src="@/assets/icons/music.svg" alt="" class="h-6 w-6" />
          </div>
        </div>

        <!-- Cover Actions -->
        <div class="min-w-0">
          <p class="text-sm font-semibold text-primary-text">Playlist cover</p>

          <p class="mt-1 text-xs leading-5 text-text-muted">
            Choose an image for your playlist (optional)
          </p>

          <input ref="fileInput" type="file" accept="image/*" class="sr-only" @change="handleImageUpload"/>

          <div class="mt-3 flex flex-wrap gap-2">
            <button type="button" class="cursor-pointer rounded-xl bg-primary-light px-4 py-2 text-sm font-semibold text-primary
             transition duration-200 hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2
             focus-visible:outline-primary active:scale-95 motion-reduce:transform-none motion-reduce:transition-none"
             @click="openFilePicker">
              {{ coverPreview ? "Change image" : "Upload image" }}
            </button>

            <button v-if="coverPreview" type="button" class="cursor-pointer rounded-xl border border-border bg-surface px-3 py-2
             text-sm font-medium text-text-secondary transition duration-200 hover:bg-surface-light hover:text-primary-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95 motion-reduce:transform-none motion-reduce:transition-none"
             @click="removeImage">
              Remove
            </button>
          </div>
        </div>
      </div>

      <!-- Playlist Name -->
      <div class="mt-6">
        <label for="playlist-name" class="text-sm font-semibold text-primary-text">
          Playlist name
          <span class="text-primary" aria-hidden="true">*</span>
        </label>

        <input id="playlist-name" v-model.trim="playlistName" type="text" maxlength="50" required autocomplete="off" placeholder="My playlist"
          class="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-primary-text outline-none transition duration-200 placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
          @keydown.enter.prevent="handleCreatePlaylist"
        />

        <div class="mt-1 flex items-center justify-between">
          <p v-if="showNameError" class="text-xs text-primary" role="alert">
            Please enter a playlist name.
          </p>
          <span v-else></span>

          <span class="text-xs text-text-muted"> {{ playlistName.length }}/50 </span>
        </div>
      </div>

      <!-- Description -->
      <div class="mt-4">
        <label for="playlist-description" class="text-sm font-semibold text-primary-text">
          Description
          <span class="font-normal text-text-muted">(optional)</span>
        </label>

        <textarea id="playlist-description" v-model.trim="description" maxlength="150" rows="4" placeholder="What's this playlist about?"
          class="mt-2 w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-sm leading-5 text-primary-text
          outline-none transition duration-200 placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
        ></textarea>

        <p class="mt-1 text-right text-xs text-text-muted">{{ description.length }}/150</p>
      </div>

      <!-- Track -->
      <div v-if="track" class="mt-5 rounded-2xl border border-primary-light bg-primary-pale p-4">
        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
          This song will be added
        </p>

        <div class="mt-3 flex min-w-0 items-center gap-3">
          <img v-if="track.image" :src="track.image" :alt="`${track.title} album cover`" class="h-14 w-14 shrink-0 rounded-xl object-cover shadow-sm"/>

          <div v-else class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-light" aria-hidden="true">
            <img src="@/assets/icons/music.svg" alt="" class="h-6 w-6" />
          </div>

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-primary-text">
              {{ track.title }}
            </p>

            <p class="mt-0.5 truncate text-xs text-text-muted">
              {{ track.artist }}
              <template v-if="track.album">· {{ track.album }}</template>
            </p>
          </div>

          <span v-if="track.duration !== undefined" class="shrink-0 text-xs text-text-muted">
            {{ formatDuration(track.duration) }}
          </span>
        </div>
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

        <!-- Create -->
        <button type="button" class="flex-1 cursor-pointer rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white
         transition duration-200 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transform-none motion-reduce:transition-none sm:min-w-30 sm:flex-none sm:px-6"
         :disabled="!playlistName.trim() || isSaving" @click="handleCreatePlaylist">
          {{ isSaving ? "Creating..." : "Create" }}
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

const props = defineProps<{
  track?: Track | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { createPlaylist } = usePlaylists();
const { triggerToast } = useActionToast();
const { errorMessage, isSaving, runAction } = useActionError();

const playlistName = ref("");
const description = ref("");
const showNameError = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const coverFile = ref<File | null>(null);
const coverPreview = ref<string | null>(null);

// Opens the file picker
const openFilePicker = () => {
  fileInput.value?.click();
};

// Changes the playlist cover
const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file || !file.type.startsWith("image/")) return;

  coverFile.value = file;

  if (coverPreview.value) {
    URL.revokeObjectURL(coverPreview.value);
  }

  coverPreview.value = URL.createObjectURL(file);
  input.value = "";
};

// Removes the playlist cover
const removeImage = () => {
  if (coverPreview.value) {
    URL.revokeObjectURL(coverPreview.value);
  }

  coverPreview.value = null;
  coverFile.value = null;
};

// Converts the cover to a Data URL
const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Could not read playlist cover."));
    };

    reader.onerror = () => {
      reject(reader.error ?? new Error("Could not read playlist cover."));
    };

    reader.readAsDataURL(file);
  });
};

// Closes the modal
const closeModal = () => {
  if (coverPreview.value) {
    URL.revokeObjectURL(coverPreview.value);
  }

  emit("close");
};

// Creates the playlist
const handleCreatePlaylist = async () => {
  if (isSaving.value) return;

  const cleanName = playlistName.value.trim();

  if (!cleanName) {
    showNameError.value = true;
    return;
  }

  showNameError.value = false;

  let newPlaylistName = "";

  const created = await runAction(async () => {
    const coverUrl = coverFile.value ? await fileToDataUrl(coverFile.value) : null;

    const newPlaylist = await createPlaylist(
      cleanName,
      description.value.trim(),
      coverUrl,
      props.track ?? null,
    );

    if (!newPlaylist) return false;

    newPlaylistName = newPlaylist.name;
    return true;
  });

  if (!created) return;

  triggerToast({
    type: "playlist",
    action: "created",
    playlistName: newPlaylistName,
  });

  closeModal();
};

// Formats track duration
const formatDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

</script>