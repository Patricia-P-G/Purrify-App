<template>
  <!-- Genre Page -->
  <main class="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
    <!-- Genre Hero -->
    <section class="relative mb-6 overflow-hidden rounded-[22px] border border-border-pink bg-white px-5 py-7 shadow-[0_12px_35px_rgba(253,113,121,0.14)]
     sm:mb-8 sm:rounded-[26px] sm:px-8 sm:py-8 lg:mb-10 lg:rounded-[28px] lg:px-10"
     aria-labelledby="genre-heading" aria-describedby="genre-description">

      <!-- Decorative Background -->
      <div class="pointer-events-none absolute -right-16 -top-20 h-65 w-65 rounded-full bg-primary-light/70 blur-3xl" aria-hidden="true"></div>
      <div class="pointer-events-none absolute -bottom-20 right-[20%] h-50 w-50 rounded-full bg-primary-pale blur-3xl" aria-hidden="true"></div>

      <div class="relative z-10">
        <!-- Genre -->
        <p class="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-primary sm:text-sm">
          Genre
        </p>

        <h1 id="genre-heading" class="mt-3 text-3xl font-semibold text-primary-text sm:text-4xl lg:text-5xl">
          {{ genreName }}
        </h1>

        <p id="genre-description" class="mt-3 max-w-125 text-sm leading-6 text-text-secondary sm:text-base">
          Explore {{ genreName }} playlists and discover something new to listen to.
        </p>
      </div>
    </section>

    <!-- Playlists -->
    <section class="rounded-[22px] border border-border bg-surface p-4 shadow-[0_14px_42px_rgba(253,113,121,0.12)] sm:rounded-[26px] sm:p-6 lg:rounded-[28px] lg:p-7"
      aria-labelledby="playlists-heading" :aria-busy="isLoading">

      <!-- Header -->
      <div class="mb-6">
        <h2 id="playlists-heading" class="text-xl font-semibold text-primary-text sm:text-2xl">
          {{ genreName }} Playlists
        </h2>

        <p class="mt-1 text-sm text-text-secondary">
          Explore playlists selected for this genre.
        </p>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" role="status" aria-live="polite">
        <span class="sr-only">Loading {{ genreName }} playlists...</span>

        <ul class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-5 xl:grid-cols-4" aria-hidden="true">
          <li v-for="index in 8" :key="index"
            class="overflow-hidden rounded-[18px] border border-border-pink bg-surface shadow-[0_6px_18px_rgba(253,113,121,0.10)]">

            <div class="aspect-square animate-pulse bg-primary-pale motion-reduce:animate-none"></div>

            <div class="p-3 sm:p-4">
              <div class="h-4 w-3/4 animate-pulse rounded bg-surface-light motion-reduce:animate-none"></div>

              <div class="mt-2 h-3 w-1/2 animate-pulse rounded bg-surface-light motion-reduce:animate-none"></div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Error -->
      <ErrorState v-else-if="errorMessage" :message="errorMessage" @retry="loadPlaylists" />

      <!-- Playlist Grid -->
      <ul v-else-if="playlists.length"
        class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-5 xl:grid-cols-4"
        :aria-label="`${genreName} playlists`">

        <li v-for="(playlist, index) in playlists" :key="playlist.id">
          <RouterLink :to="`/playlists/${playlist.id}`"
            class="group block h-full overflow-hidden rounded-[18px] border border-border-pink bg-surface shadow-[0_6px_18px_rgba(253,113,121,0.12)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(253,113,121,0.26)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:rounded-[20px] motion-reduce:transform-none motion-reduce:transition-none"
            :aria-label="`Open ${playlist.name} playlist`">

            <!-- Spotify Playlist Cover -->
            <div class="relative aspect-square overflow-hidden bg-primary-pale">
              <img v-if="playlist.image" :src="playlist.image" :alt="`${playlist.name} playlist cover`"
                :loading="index === 0 ? 'eager' : 'lazy'" :fetchpriority="index === 0 ? 'high' : 'auto'"
                decoding="async" width="300" height="300"
                class="h-full w-full object-cover transition duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
              />

              <!-- Image Fallback -->
              <div v-else class="flex h-full w-full items-center justify-center bg-primary-light" aria-hidden="true">
                <img src="@/assets/icons/music.svg" alt="" class="h-12 w-12"/>
              </div>

              <!-- Play Icon -->
              <PlayButton :active="true" :playing="false" class="absolute bottom-3 right-3 translate-y-2 opacity-0
               group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100
               motion-reduce:transform-none motion-reduce:transition-none"
              />
            </div>

            <!-- Playlist Information -->
            <div class="p-3 sm:p-4">
              <h3 class="truncate text-sm font-semibold text-primary-text sm:text-base">
                {{ playlist.name }}
              </h3>

              <p class="mt-1 truncate text-xs text-text-secondary">
                {{ playlist.owner }}
              </p>

              <p v-if="playlist.description" class="mt-2 line-clamp-2 text-xs leading-5 text-text-secondary">
                {{ playlist.description }}
              </p>
            </div>
          </RouterLink>
        </li>
      </ul>

      <!-- No Playlists -->
      <p v-else class="py-12 text-center text-sm text-text-secondary" role="status">
        No {{ genreName }} playlists found.
      </p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import ErrorState from "@/components/ui/ErrorState.vue";
import { useRoute } from "vue-router";
import { useHead } from "@unhead/vue";
import PlayButton from "@/components/music/PlayButton.vue";
import { getGenrePlaylists, type GenrePlaylist } from "@/services/spotify/api/genrePlaylists";

// Router
const route = useRoute();

// Stores Playlists Returned by Spotify
const playlists = ref<GenrePlaylist[]>([]);

// Loading State
const isLoading = ref(true);

// Error State
const errorMessage = ref("");

// Gets the Genre from the URL
const genreSlug = computed(() => {
  return String(route.params.genre ?? "");
});

// Converts the URL Slug into the Correct Genre Name
const genreName = computed(() => {
  const genreNames: Record<string, string> = {
    pop: "Pop",
    "k-pop": "K-Pop",
    chill: "Chill",
    "hip-hop": "Hip Hop",
    indie: "Indie",
    rock: "Rock",
    "r-and-b": "R&B",
    jazz: "Jazz",
    "lo-fi": "Lo-fi",
    electronic: "Electronic",
    classical: "Classical",
    acoustic: "Acoustic",
  };

  return genreNames[genreSlug.value] ?? genreSlug.value;
});

// Updates Page SEO
useHead({
  title: computed(() => `${genreName.value} | Purrify`),

  meta: [
    {
      name: "description",
      content: computed(() =>
        `Explore ${genreName.value} playlists and discover new music on Purrify.`
      ),
    },
  ],
});

// Gets Playlists from Spotify
const loadPlaylists = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = "";

    playlists.value = await getGenrePlaylists(genreName.value, 10);
  } catch (error) {
    console.error("Failed to load genre playlists:", error);
    errorMessage.value = "Unable to load playlists right now.";
  } finally {
    isLoading.value = false;
  }
};

// Loads Playlists When GenreView Opens
onMounted(() => {
  void loadPlaylists();
});

// Reloads Playlists When Changing Genre
watch(genreSlug, () => {
  playlists.value = [];
  void loadPlaylists();
});

</script>