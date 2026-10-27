<template>
  <!-- Delete Playlist Modal -->
  <div class="fixed inset-0 z-210 flex items-center justify-center bg-black/35 px-4" @click.self="emit('close')">
    <section class="w-full max-w-sm rounded-[26px] bg-surface p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.18)]" role="alertdialog"
      aria-modal="true" aria-labelledby="delete-playlist-heading">
      <!-- Trash Icon -->
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50" aria-hidden="true">
        <img src="@/assets/icons/trash.svg" alt="" class="h-7 w-7"/>
      </div>

      <!-- Title -->
      <h2 id="delete-playlist-heading" class="mt-4 text-xl font-semibold text-primary-text">
        Delete playlist?
      </h2>

      <!-- Playlist Name -->
      <p class="mt-2 text-sm leading-6 text-text-muted">
        "{{ playlistName }}" will be deleted. Are you sure u want to proceed?
      </p>

      <div class="mt-6 flex gap-3">
        <button type="button" class="flex-1 cursor-pointer rounded-full border border-border px-4 py-2.5 text-sm font-semibold
         text-primary-text transition duration-200 hover:bg-surface-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
         @click="emit('close')">
          Cancel
        </button>

        <button type="button" class="flex-1 cursor-pointer rounded-full bg-red-500 px-4 py-2.5 text-sm font-semibold text-white
         transition duration-200 hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
         @click="emit('confirm')">
          Delete
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  playlistName: string;
}>();

const emit = defineEmits<{
  close: [];
  confirm: [];
}>();
</script>