<template>
  <!-- Backdrop -->
  <div class="fixed inset-0 z-200 flex items-center justify-center overflow-y-auto bg-black/30 px-3 py-4 sm:px-4 sm:py-6" @click.self="closeModal">

    <!-- Modal -->
    <section class="max-h-[calc(100dvh-2rem)] w-full max-w-170 overflow-y-auto rounded-[22px] bg-surface p-4 shadow-[0_24px_70px_rgba(75,75,85,0.22)] sm:max-h-[calc(100dvh-3rem)] sm:rounded-[28px] sm:p-6 md:p-8"
      role="dialog" aria-modal="true" aria-labelledby="edit-playlist-heading">

      <!-- Header -->
      <header class="flex items-center justify-between gap-4">
        <!-- Title -->
        <h2 id="edit-playlist-heading" class="text-xl font-semibold text-primary-text sm:text-2xl">
          Edit Playlist
        </h2>

        <!-- Close Button -->
        <button type="button" class="group/close flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-text-muted transition duration-200 hover:bg-primary-light
         hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-90 motion-reduce:transform-none motion-reduce:transition-none"
          aria-label="Close edit playlist" @click="closeModal">
          <!-- Close Icon -->
          <img src="@/assets/icons/close.svg" alt="" aria-hidden="true" class="block h-5 w-5 group-hover/close:hidden"/>
          <!-- Close Hover Icon  -->
          <img src="@/assets/icons/close-hover.svg" alt="" aria-hidden="true" class="hidden h-5 w-5 group-hover/close:block"/>
        </button>
      </header>

      <!-- Edit Playlist Content -->
      <div class="mt-5 grid gap-6 md:mt-7 md:grid-cols-[190px_minmax(0,1fr)] md:items-start md:gap-7">

        <!-- Playlist Picture -->
        <div class="mx-auto w-full max-w-40 sm:max-w-48 md:max-w-none">
          <p class="mb-3 text-center text-sm font-medium text-text-secondary md:text-left">
            Current Picture
          </p>

          <!-- Playlist Picture Layout -->
          <div class="aspect-square w-full overflow-hidden rounded-[20px] bg-primary-light shadow-[0_8px_22px_rgba(75,75,85,0.10)]">
            <img v-if="coverPreview" :src="coverPreview" :alt="`${name || playlist.name} playlist cover`" class="h-full w-full object-cover"/>

            <div v-else class="flex h-full w-full items-center justify-center bg-primary-light">
              <div class="flex h-14 w-14 items-center justify-center rounded-full bg-surface shadow-sm sm:h-16 sm:w-16" aria-hidden="true">
                <img src="@/assets/icons/music.svg" alt="" class="h-7 w-7 sm:h-8 sm:w-8"/>
              </div>
            </div>
          </div>

          <!-- Change Picture -->
          <label class="mt-3 flex cursor-pointer items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-primary transition duration-200 hover:bg-primary-light active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none sm:mt-4">
            Change Picture
            <input type="file" accept="image/*" class="sr-only" @change="handleFileChange"/>
          </label>

          <p v-if="coverError" class="mt-2 text-center text-xs text-red-700 md:text-left" role="alert">
            {{ coverError }}
          </p>
        </div>

        <!-- Form -->
        <div class="min-w-0">
          <!-- Playlist Name -->
          <div>
            <label for="edit-playlist-name" class="mb-2 block text-sm font-medium text-text-secondary">
              Playlist Name
            </label>

            <input id="edit-playlist-name" v-model="name" type="text" maxlength="50" autocomplete="off"
              class="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-primary-text outline-none transition duration-200 placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10"
              placeholder="Playlist name"/>

            <p class="mt-1 text-right text-xs text-text-muted">
              {{ name.length }}/50
            </p>
          </div>

          <!-- Description -->
          <div class="mt-4 sm:mt-5">
            <label for="edit-playlist-description" class="mb-2 block text-sm font-medium text-text-secondary">
              Description
            </label>

            <textarea id="edit-playlist-description" v-model="description" maxlength="200" rows="4" class="w-full resize-none rounded-2xl border border-border
             bg-surface px-4 py-3 text-sm leading-6 text-primary-text outline-none transition duration-200 placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/10 md:min-h-32"
             placeholder="Add a description..."></textarea>

            <p class="mt-1 text-right text-xs text-text-muted">
              {{ description.length }}/200
            </p>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <p v-if="errorMessage" role="alert" class="mt-4 text-sm text-red-600">
        {{ errorMessage }}
      </p>

      <!-- Actions -->
      <footer class="mt-6 flex w-full gap-3 sm:mt-8 sm:justify-end">
        <!-- Cancel -->
        <button type="button" class="flex-1 cursor-pointer rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-primary-text
         transition duration-200 hover:bg-surface-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95
         motion-reduce:transform-none motion-reduce:transition-none sm:min-w-30 sm:flex-none sm:px-6"
         @click="closeModal">
          Cancel
        </button>

        <!-- Save -->
        <button type="button" class="flex-1 cursor-pointer rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-primary-hover
         focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transform-none motion-reduce:transition-none sm:min-w-30 sm:flex-none sm:px-6"
         :disabled="!name.trim() || isSaving" @click="saveChanges">
          {{ isSaving ? "Saving..." : "Save" }}
        </button>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { usePlaylists } from "@/composables/usePlaylists";
import { useActionError } from "@/composables/useActionError";
import { useCoverUpload } from "@/composables/useCoverUpload";
import type { Playlist } from "@/composables/usePlaylists";

const props = defineProps<{
  playlist: Playlist;
}>();

const emit = defineEmits<{
  close: [];
  saved: [playlistName: string];
}>();

const { updatePlaylist } = usePlaylists();
const { errorMessage, isSaving, runAction } = useActionError();

const name = ref(props.playlist.name);
const description = ref(props.playlist.description ?? "");

// Cover image (a new image is uploaded to Appwrite Storage when saving)
const {
  preview: coverPreview,
  error: coverError,
  hasChanged: coverChanged,
  handleFileChange,
  resolveUrl,
  discardUpload,
} = useCoverUpload(props.playlist.cover ?? null);

// Closes the modal
const closeModal = () => {
  emit("close");
};

// Saves the playlist changes
const saveChanges = async () => {
  if (!name.value.trim() || isSaving.value) return;

  const cleanName = name.value.trim();
  const cleanDescription = description.value.trim();

  const hasChanges =
    props.playlist.name !== cleanName ||
    props.playlist.description !== cleanDescription ||
    coverChanged.value;

  if (!hasChanges) {
    closeModal();
    return;
  }

  const saved = await runAction(async () => {
    const coverUrl = await resolveUrl();

    try {
      const updated = await updatePlaylist(
        props.playlist.id,
        cleanName,
        cleanDescription,
        coverUrl,
      );

      if (!updated) await discardUpload();

      return updated;
    } catch (error) {
      await discardUpload();
      throw error;
    }
  });

  if (!saved) return;

  emit("saved", cleanName);
  closeModal();
};

</script>