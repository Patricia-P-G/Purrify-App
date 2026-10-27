
<template>
  <main class="px-4 py-5 sm:px-6 sm:py-8" aria-labelledby="playlists-heading">
    <!-- Hero -->
    <MusicHeroLayout heading-id="playlists-heading" label="Your Library" title="Playlists"
      description="All your favorite songs, organized your way."
      :song-count="playlists.length" singular-label="playlist" plural-label="playlists">

      <!-- For Button -->
      <template #actions>
        <!-- Create Playlist Button -->
        <button type="button"
          class="flex w-64 cursor-pointer items-center justify-center gap-2 self-center rounded-full bg-primary px-6 py-2.5 font-semibold
          text-white shadow-[0_6px_16px_rgba(168,63,98,0.22)] transition duration-200 hover:bg-primary-hover
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95
          motion-reduce:transform-none motion-reduce:transition-none sm:w-auto sm:hover:scale-105"
          @click="showCreatePlaylist = true">
          <span>Create Playlist</span>
        </button>
      </template>
    </MusicHeroLayout>

    <!-- Playlists -->
    <section class="section-card mt-7 min-h-105" aria-labelledby="your-playlists-heading">

      <!-- Header -->
      <div class="section-card-header">
        <h2 id="your-playlists-heading" class="section-card-title">
          Your playlists
        </h2>
      </div>

      <!-- Playlist Container -->
      <div v-if="playlists.length > 0"
        class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

        <!-- Playlist Card -->
        <article v-for="playlist in playlists" :key="playlist.id" class="min-w-0">

          <!-- Clickable Playlist -->
          <button type="button" class="group block w-full cursor-pointer rounded-2xl p-2 text-left transition duration-200 hover:bg-surface-light
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"
            :aria-label="`Open ${playlist.name} playlist`" @click="openPlaylist(playlist.id)">

            <!-- Playlist Cover -->
            <div class="aspect-square w-full overflow-hidden rounded-2xl bg-primary-light
              shadow-[0_6px_16px_rgba(75,75,85,0.14)]
              transition duration-200
              group-hover:shadow-[0_8px_22px_rgba(75,75,85,0.20)]
              motion-reduce:transition-none">

              <img v-if="playlist.cover" :src="playlist.cover"
                :alt="`${playlist.name} playlist cover`"
                loading="lazy" decoding="async" width="300" height="300"
                class="h-full w-full object-cover"/>

              <!-- Playlist Cover Fallback -->
              <div v-else class="flex h-full w-full items-center justify-center bg-primary-light">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-surface
                  shadow-[0_5px_16px_rgba(75,75,85,0.16)]" aria-hidden="true">
                  <img src="@/assets/icons/music.svg" alt="" class="h-6 w-6"/>
                </div>
              </div>
            </div>

            <!-- Playlist Information -->
            <h3 class="mt-3 truncate text-sm font-semibold text-primary-text
              transition-colors duration-200 group-hover:text-primary
              motion-reduce:transition-none">
              {{ playlist.name }}
            </h3>

            <p class="mt-1 text-xs text-text-secondary">
              {{ playlist.tracks.length }}
              {{ playlist.tracks.length === 1 ? "song" : "songs" }}
            </p>

            <p v-if="playlist.description"
              class="mt-1 line-clamp-2 text-xs leading-5 text-text-muted">
              {{ playlist.description }}
            </p>
          </button>
        </article>
      </div>

      <!-- Empty State -->
      <div v-else class="flex min-h-87.5 items-center justify-center px-6 py-12">
        <div class="max-w-90 text-center">

          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-light"
            aria-hidden="true">
            <img src="@/assets/icons/music.svg" alt="" class="h-8 w-8"/>
          </div>

          <h3 class="mt-5 text-lg font-semibold text-primary-text">
            No playlists yet
          </h3>

          <p class="mx-auto mt-2 max-w-75 text-sm leading-6 text-text-muted">
            Create your first playlist and start collecting your favorite songs.
          </p>
        </div>
      </div>
    </section>

    <!-- Create Playlist Modal -->
    <CreatePlaylist v-if="showCreatePlaylist" @close="showCreatePlaylist = false"/>

    <!-- Action Toast -->
    <ActionToast :show="showToast" :type="toastType" :action="toastAction"
      :track-name="toastTrackName" :playlist-name="toastPlaylistName"
      @close="closeToast"/>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useHead } from "@unhead/vue";
import MusicHeroLayout from "@/components/music/MusicHeroLayout.vue";
import ActionToast from "@/components/ui/ActionToast.vue";
import CreatePlaylist from "@/features/playlists/components/CreatePlaylist.vue";
import { usePlaylists } from "@/composables/usePlaylists";
import { useActionToast } from "@/composables/useActionToast";

// Router
const router = useRouter();

// Playlists
const { playlists, loadPlaylists } = usePlaylists();

// Action Toast
const {
  showToast,
  toastType,
  toastAction,
  toastTrackName,
  toastPlaylistName,
  closeToast,
} = useActionToast();

// Modal State
const showCreatePlaylist = ref(false);

// Open Selected Playlist
const openPlaylist = (playlistId: string) => {
  router.push({
    name: "playlist",
    params: { id: playlistId },
  });
};

// Load Playlists From Appwrite
onMounted(async () => {
  try {
    await loadPlaylists();
  } catch (error) {
    console.error("Failed to load playlists:", error);
  }
});

// Page SEO
useHead({
  title: "Playlists | Purrify",
  meta: [
    {
      name: "description",
      content: "Create, organize, and manage your music playlists on Purrify.",
    },
  ],
});

</script>