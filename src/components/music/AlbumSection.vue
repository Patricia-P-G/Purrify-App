<template>
  <!-- Albums Section -->
  <section :class="unstyled ? '' : 'section-card'" :aria-labelledby="headingId">

    <!-- Header -->
    <div :class="unstyled ? 'mb-4 flex items-center justify-between' : 'section-card-header'">
      <h2 :id="headingId"
        :class="unstyled ? 'text-lg font-semibold text-primary-text' : 'section-card-title'">
        {{ title }}
      </h2>

      <!-- See All Button -->
      <button v-if="albums.length > initialLimit" type="button"
        class="btn-base btn-sm cursor-pointer border border-primary bg-primary-pale text-primary
        hover:bg-primary-light"
        :aria-expanded="showAllAlbums"
        @click="showAllAlbums = !showAllAlbums">
        {{ showAllAlbums ? "Show less" : "See all" }}
      </button>
    </div>

    <!-- Album Grid -->
    <div v-if="visibleAlbums.length" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

      <!-- Album Card -->
      <RouterLink v-for="album in visibleAlbums" :key="album.id"
        :to="{ name: 'album', params: { id: album.id } }"
        :aria-label="`View ${album.name} album`"
        class="group block cursor-pointer rounded-2xl p-2 transition duration-200
        hover:bg-surface-light focus-visible:outline-2 focus-visible:outline-offset-2
        focus-visible:outline-primary motion-reduce:transition-none">

        <!-- Album Cover -->
        <img v-if="album.image" :src="album.image" :alt="`${album.name} album cover`"
          loading="lazy" decoding="async" width="300" height="300"
          class="aspect-square w-full rounded-2xl object-cover shadow-[0_6px_16px_rgba(75,75,85,0.14)]
          transition duration-200 group-hover:shadow-[0_8px_22px_rgba(75,75,85,0.20)]"/>

        <!-- Album Cover Fallback -->
        <div v-else class="flex aspect-square items-center justify-center rounded-2xl bg-primary-light"
          aria-hidden="true">
          <img src="@/assets/icons/music.svg" alt="" class="h-10 w-10"/>
        </div>

        <!-- Album Information -->
        <h3 class="mt-3 truncate text-sm font-semibold text-primary-text transition-colors duration-200
          group-hover:text-primary motion-reduce:transition-none">
          {{ album.name }}
        </h3>

        <!-- Search View: Artist Name and Year -->
        <template v-if="variant === 'search'">
          <p v-if="album.artist" class="mt-1 truncate text-xs text-text-secondary">
            {{ album.artist }}
          </p>

          <p v-if="album.year" class="mt-1 text-xs text-text-secondary">
            {{ album.year }}
          </p>
        </template>

        <!-- Artist View: Year and Album Type -->
        <p v-else class="mt-1 text-xs text-text-secondary">
          {{ album.year }} · {{ album.type }}
        </p>
      </RouterLink>
    </div>

    <!-- Empty State -->
    <p v-else class="py-8 text-center text-sm text-text-secondary" role="status">
      No albums available.
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

// Album Data
interface AlbumCardData {
  id: string;
  name: string;
  image?: string | null;
  artist?: string;
  year?: string | number;
  type?: string;
}

// Component Props
const props = withDefaults(defineProps<{
  albums: AlbumCardData[];
  title?: string;
  headingId?: string;
  initialLimit?: number;
  variant?: "artist" | "search";
  unstyled?: boolean;
}>(), {
  title: "Albums",
  headingId: "albums-heading",
  initialLimit: 4,
  variant: "artist",
  unstyled: false,
});

// Album Display State
const showAllAlbums = ref(false);

// Displays the First Albums or All Albums
const visibleAlbums = computed(() => {
  return showAllAlbums.value
    ? props.albums
    : props.albums.slice(0, props.initialLimit);
});

// Resets Album Display When Albums Change
watch(() => props.albums, () => {
  showAllAlbums.value = false;
});

</script>