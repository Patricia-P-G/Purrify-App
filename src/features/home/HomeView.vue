<template>
  <main class="p-4 sm:p-5 md:p-6 lg:p-7" aria-labelledby="home-heading">
    <!-- Main page heading for accessibility and SEO -->
    <h1 id="home-heading" class="sr-only">
      Purrify - Discover Music, Artists and Playlists
    </h1>

    <!-- Hero + Recently Played -->
    <section class="flex flex-col gap-5 xl:flex-row xl:items-start xl:gap-6"
     aria-label="Featured music and recently played">

      <!-- Left -->
      <div class="min-w-0 flex-1">
        <HeroSection />
      </div>

      <!-- Right -->
      <aside class="w-full shrink-0 xl:w-80" aria-label="Recently played music">
        <RecentlyPlayed />
      </aside>
    </section>

    <!-- Main Content -->
    <section class="mt-6 flex flex-col gap-5 xl:flex-row xl:items-start xl:gap-6"
     aria-label="Personalized music recommendations">

      <!-- Left Column -->
      <div class="flex min-w-0 flex-1 flex-col gap-6">
        <MadeForYou />
        <RecommendedForYou />
      </div>

      <!-- Right Column -->
      <aside class="w-full shrink-0 space-y-6 xl:w-80" aria-label="Explore artists and genres">
        <TopArtists />
      </aside>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useHead } from "@unhead/vue";
import HeroSection from "@/features/home/components/HeroSection.vue";
import RecentlyPlayed from "@/features/home/components/RecentlyPlayed.vue";
import MadeForYou from "@/features/home/components/MadeForYou.vue";
import TopArtists from "@/features/home/components/TopArtists.vue";
import RecommendedForYou from "@/features/home/components/RecommendedForYou.vue";

// SEO
const pageTitle = "Discover Music, Artists & Playlists | Purrify";

const pageDescription =
  "Discover music on Purrify. Explore recommended songs, revisit recently played tracks, discover top artists, and find music genres you'll love.";

useHead({
  title: pageTitle,

  // Canonical URL
  link: [
    {
      rel: "canonical",
      href: "https://your-purrify-domain.com/home",
    },
  ],

  meta: [
    {
      name: "description",
      content: pageDescription,
    },

    // Open Graph
    {
      property: "og:type",
      content: "website",
    },
    {
      property: "og:site_name",
      content: "Purrify",
    },
    {
      property: "og:title",
      content: pageTitle,
    },
    {
      property: "og:description",
      content: pageDescription,
    },
    {
      property: "og:url",
      content: "https://your-purrify-domain.com/home",
    },
  ],
});

</script>