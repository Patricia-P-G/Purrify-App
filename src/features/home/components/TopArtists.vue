<template>
  <!-- Top Artists Section -->
  <section class="section-card"
    aria-labelledby="top-artists-heading" :aria-busy="isLoading">

    <!-- Header -->
    <div class="section-card-header">
      <!-- Title -->
      <h2 id="top-artists-heading" class="section-card-title">
        Top artists
      </h2>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" role="status" aria-live="polite">
      <span class="sr-only">
        Loading top artists...
      </span>

      <!-- Artist Skeletons -->
      <ul class="flex flex-col gap-2" aria-hidden="true">
        <li v-for="index in 4" :key="index">
          <div class="flex w-full items-center gap-3 rounded-2xl border border-transparent p-2.5">
            <!-- Image Skeleton -->
            <div class="h-15 w-15 shrink-0 rounded-full bg-surface-light"></div>

            <!-- Text Skeletons -->
            <div class="min-w-0 flex-1">
              <div class="h-4 w-2/3 rounded bg-surface-light"></div>
              <div class="mt-2 h-3 w-1/3 rounded bg-surface-light"></div>
            </div>

            <!-- Arrow Skeleton -->
            <div class="h-10 w-10 shrink-0 rounded-full bg-primary-light"></div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="py-6 text-center" role="alert">
      <p class="text-sm text-text-secondary">
        {{ loadError }}
      </p>

      <button type="button" class="btn-base btn-sm mt-3 border border-primary bg-primary-pale text-primary hover:bg-primary-light"
        @click="loadTopArtists">
        Try again
      </button>
    </div>

    <!-- Artists -->
    <ul v-else-if="topArtists.length" class="flex flex-col gap-2" aria-label="Your top Spotify artists">
      <li v-for="artist in topArtists" :key="artist.id">

        <!-- Artist Card -->
        <RouterLink :to="`/artists/${artist.id}`"class="song-card group flex w-full cursor-pointer items-center gap-3 p-2.5 text-left
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
          active:scale-[0.99] motion-reduce:transform-none motion-reduce:transition-none"
          :aria-label="`Open ${artist.name} artist page`">

          <!-- Artist Image -->
          <div class="relative shrink-0">
            <img v-if="artist.image" :src="artist.image" alt="" loading="lazy" decoding="async" width="60" height="60"
              class="h-15 w-15 rounded-full object-cover shadow-[0_4px_10px_rgba(75,75,85,0.16)]
              transition duration-200 group-hover:shadow-[0_6px_14px_rgba(75,75,85,0.22)]
              motion-reduce:transition-none"
            />

            <!-- Image Fallback -->
            <div v-else class="flex h-15 w-15 items-center justify-center rounded-full bg-primary-light text-primary" aria-hidden="true">
              <img src="@/assets/icons/user.svg" alt="" class="h-6 w-6"/>
            </div>
          </div>

          <!-- Artist Information -->
          <div class="min-w-0 flex-1">
            <!-- Artist Name -->
            <h3 class="truncate text-sm font-semibold text-primary-text transition duration-200
              group-hover:text-primary motion-reduce:transition-none">
              {{ artist.name }}
            </h3>

            <p class="mt-0.5 text-sm text-text-secondary">
              Artist
            </p>
          </div>

          <!-- Arrow -->
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light
            opacity-80 shadow-[0_4px_10px_rgba(75,75,85,0.14)] transition duration-200
            group-hover:scale-[1.03] group-hover:bg-primary group-hover:opacity-100
            group-hover:shadow-[0_6px_14px_rgba(75,75,85,0.20)]
            motion-reduce:transform-none motion-reduce:transition-none" aria-hidden="true">

            <!-- Normal Arrow -->
            <img src="@/assets/icons/arrow-right-icon.svg" alt="" class="block h-4 w-4 group-hover:hidden"/>

            <!-- Hover Arrow -->
            <img src="@/assets/icons/arrow-right-hover-icon.svg" alt="" class="hidden h-4 w-4 group-hover:block"/>
          </span>
        </RouterLink>
      </li>
    </ul>

    <!-- Empty State -->
    <p v-else class="py-6 text-center text-sm text-text-secondary" role="status">
      No top artists found.
    </p>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getTopArtists } from "@/services/spotify/api/topArtists";
import type { Artist } from "@/types/music";

// Stores the user's top Spotify artists
const topArtists = ref<Artist[]>([]);

// Tracks whether Spotify data is loading
const isLoading = ref(true);

// Stores an error message if the request fails
const loadError = ref("");

// Gets the user's top Spotify artists
const loadTopArtists = async () => {
  isLoading.value = true;
  loadError.value = "";

  try {
    topArtists.value = await getTopArtists();
  } catch (error) {
    console.error("Failed to load top artists:", error);
    loadError.value = "We could not load your top artists.";
  } finally {
    isLoading.value = false;
  }
};

// Gets the user's top artists when the component mounts
onMounted(loadTopArtists);

</script>