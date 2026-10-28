<template>
  <!-- Discovery Page -->
  <main class="px-4 py-5 sm:px-6 sm:py-8">
    <!-- Discover Hero -->
    <MusicHeroLayout heading-id="discover-heading" label="Discover" title="Discover Music" description="Explore new music and find your next favorite song.">
      <template #cover>
        <div class="flex h-full w-full items-center justify-center bg-primary-light" aria-hidden="true">
          <img src="@/assets/icons/discover-hover.svg" alt="" class="h-16 w-16"/>
        </div>
      </template>
    </MusicHeroLayout>

    <!-- Browse by Genre -->
    <section id="genres" class="rounded-[22px] border border-border bg-surface p-4 shadow-[0_14px_42px_rgba(253,113,121,0.12)] sm:rounded-[26px] sm:p-6 lg:rounded-[28px] lg:p-7"
      aria-labelledby="genres-heading" aria-describedby="genres-description">
      <!-- Section Header -->
      <div class="mb-5 sm:mb-6">
        <h2 id="genres-heading" class="text-xl font-semibold text-primary-text sm:text-2xl">
          Browse by Genre
        </h2>

        <p id="genres-description" class="mt-1 text-sm text-text-secondary">
          Explore music by mood and style.
        </p>
      </div>

      <!-- Genres -->
      <ul class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-5 xl:grid-cols-4">
        <li v-for="(genre, index) in genres" :key="genre.name">
          <button type="button" class="group relative aspect-[1.1/1] w-full cursor-pointer overflow-hidden rounded-2xl border border-border-pink text-left shadow-[0_5px_15px_rgba(253,113,121,0.14)]
           transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(253,113,121,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:translate-y-0 sm:aspect-1.25/1 sm:rounded-[18px] lg:aspect-[1.35/1] lg:rounded-[20px] motion-reduce:transform-none motion-reduce:transition-none"
           @click="openGenre(genre)">
            <img :src="genre.image" alt="" aria-hidden="true" :loading="index < 4 ? 'eager' : 'lazy'"
              :fetchpriority="index === 0 ? 'high' : 'auto'" decoding="async" class="absolute inset-0 h-full w-full object-cover transition duration-300
              group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
            />

            <div class="absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent" aria-hidden="true"></div>

            <!-- Genre Information -->
            <div class="absolute bottom-0 left-0 z-10 w-full p-3 sm:p-4">
              <h3 class="truncate text-sm font-semibold text-white sm:text-base">
                {{ genre.name }}
              </h3>

              <p class="mt-0.5 truncate text-[11px] text-white/85 sm:text-xs">
                {{ genre.description }}
              </p>
            </div>
          </button>
        </li>
      </ul>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import MusicHeroLayout from "@/components/music/MusicHeroLayout.vue";

import kpopCard from "@/assets/images/genres/k-pop-card.webp";
import chillCard from "@/assets/images/genres/chill-card.webp";
import hipHopCard from "@/assets/images/genres/hip-hop-card.webp";
import indieCard from "@/assets/images/genres/indie-card.webp";
import rockCard from "@/assets/images/genres/rock-card.webp";
import rAndBCard from "@/assets/images/genres/r-and-b-card.webp";
import jazzCard from "@/assets/images/genres/jazz-card.webp";
import lofiCard from "@/assets/images/genres/lofi-card.webp";
import electronicCard from "@/assets/images/genres/electronic-card.webp";
import classicalCard from "@/assets/images/genres/classical-card.webp";
import acousticCard from "@/assets/images/genres/acoustic-card.webp";

interface Genre {
  name: string;
  description: string;
  image: string;
}

const router = useRouter();

// Genres displayed on the Discover page
const genres: Genre[] = [
  {
    name: "Pop",
    description: "Popular hits",
    image: "/images/pop-card.webp",
  },
  {
    name: "K-Pop",
    description: "Korean pop",
    image: kpopCard
  },
  {
    name: "Chill",
    description: "Relax and unwind",
    image: chillCard
  },
  {
    name: "Hip Hop",
    description: "Beats and flows",
    image: hipHopCard
  },
  {
    name: "Indie",
    description: "Independent sounds",
    image: indieCard
  },
  {
    name: "Rock",
    description: "Rock favorites",
    image: rockCard
  },
  {
    name: "R&B",
    description: "Smooth rhythms",
    image: rAndBCard
  },
  {
    name: "Jazz",
    description: "Jazz classics",
    image: jazzCard
  },
  {
    name: "Lo-fi",
    description: "Study beats",
    image: lofiCard
  },
  {
    name: "Electronic",
    description: "Electronic energy",
    image: electronicCard
  },
  {
    name: "Classical",
    description: "Timeless pieces",
    image: classicalCard
  },
  {
    name: "Acoustic",
    description: "Warm acoustic sounds",
    image: acousticCard
  },
];

// Opens the selected genre page
const openGenre = (genre: Genre) => {
  const genreSlug = genre.name
    .toLowerCase()
    .replace("&", "and")
    .replace(/\s+/g, "-");

  router.push({
    name: "genre",
    params: {
      genre: genreSlug,
    },
  });
};

// Page SEO
onMounted(() => {
  document.title = "Discover | Purrify";

  let description = document.querySelector<HTMLMetaElement>(
    'meta[name="description"]'
  );

  if (!description) {
    description = document.createElement("meta");
    description.name = "description";
    document.head.appendChild(description);
  }

  description.content =
    "Discover new music and explore songs by genre on Purrify.";
});

</script>