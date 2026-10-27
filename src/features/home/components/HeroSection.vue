<template>
  <section class="w-full" aria-labelledby="featured-music-heading">
    <!-- Accessible section heading -->
    <h2 id="featured-music-heading" class="sr-only">
      Featured music
    </h2>

    <!-- Swiper Carousel -->
    <Swiper :modules="[Navigation, Pagination, Autoplay, A11y]" :slides-per-view="1" :loop="true" :autoplay="autoplayOptions" 
      :a11y="{
        enabled: true,
        prevSlideMessage: 'Previous featured music',
        nextSlideMessage: 'Next featured music',
        firstSlideMessage: 'This is the first featured slide',
        lastSlideMessage: 'This is the last featured slide',
      }"
      :pagination="{ clickable: true, renderBullet }" :navigation="true" class="hero-swiper h-70 w-full overflow-hidden rounded-3xl transition-all duration-300 sm:h-80 md:h-90 lg:h-100 lg:rounded-4xl">

      <!-- Swiper Slides -->
      <SwiperSlide v-for="(slide, index) in slides" :key="slide.id">
        <!-- Swiper Slides Container -->
        <article class="relative h-full w-full">
          <!-- Hero image -->
          <img :src="slide.image" :alt="slide.alt" :loading="index === 0 ? 'eager' : 'lazy'" :fetchpriority="index === 0 ? 'high' : 'auto'"
            decoding="async" width="1600" height="700" class="h-full w-full object-cover"
          />

          <!-- Slide content -->
          <div class="absolute left-5 top-1/2 max-w-50 -translate-y-1/2 transition-all duration-300 sm:left-8 sm:max-w-60 md:left-10 md:max-w-65 lg:left-16 lg:max-w-70">
            <!-- Title -->
            <h3 class="text-2xl font-bold text-white transition-all duration-300 sm:text-3xl lg:text-4xl">
              {{ slide.title }}
            </h3>

            <!-- Description -->
            <p class="mt-2 text-sm text-white transition-all duration-300 sm:text-base lg:text-lg">
              {{ slide.description }}
            </p>

            <!-- Play mood -->
            <button type="button" class="btn-base btn-md group mt-4 flex cursor-pointer items-center gap-2 bg-white text-sm text-primary hover:scale-105 hover:bg-primary hover:text-white focus-visible:outline-white sm:mt-5 sm:text-base"
              :disabled="isLoading" :aria-label=" isLoading ? `Loading ${slide.title}` : `Play ${slide.title}`" 
              @click="handlePlay(slide)">

              <!-- Icons  -->
              <span class="relative h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true">
                <!-- Play Icon -->
                <img src="@/assets/icons/play-icon.svg" alt="" width="20" height="20" class="block h-full w-full group-hover:hidden"/>
                <!-- Play Icon Hover -->
                <img src="@/assets/icons/play-hover-icon.svg" alt="" width="20" height="20" class="hidden h-full w-full group-hover:block"/>
              </span>

              <span>
                {{ isLoading ? "Loading..." : "Play Now" }}
              </span>
            </button>

            <!-- Accessible error feedback -->
            <p v-if="errorMessage" class="mt-2 text-sm font-medium text-white" role="alert">
              {{ errorMessage }}
            </p>
          </div>

        </article>
      </SwiperSlide>
    </Swiper>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination, Autoplay, A11y } from "swiper/modules";
import { usePlayer } from "@/composables/usePlayer";
import { getTracksForMood, type MusicMood } from "@/services/spotify/api/heroTracks";
import chillImage from "@/assets/images/hero-2-official.webp";
import nightImage from "@/assets/images/hero-3.webp";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Types
// Declaring what the content in the slides should follow
interface HeroSlide {
  id: number;
  title: string;
  description: string;
  image: string;
  alt: string;
  mood: MusicMood;
}

// Player
const { playTracks } = usePlayer();

// UI State
const isLoading = ref(false);
const errorMessage = ref("");

// Accessibility
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const autoplayOptions = prefersReducedMotion ? false : { delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true };

// Contains the content of each slide
const slides: HeroSlide[] = [
  {
    id: 1,
    title: "Focus Mode",
    description:"Lo-fi beats to help you stay focused",
    image: "/images/hero-1-1000.webp",
    alt: "Cat studying at a desk while listening to music",
    mood: "focus",
  },
  {
    id: 2,
    title: "Chill Afternoon",
    description: "Soft sounds for a slow and cozy afternoon",
    image: chillImage,
    alt: "Cat relaxing during a cozy afternoon",
    mood: "chill",
  },
  {
    id: 3,
    title: "Night Vibes",
    description: "Relaxing music for peaceful late nights",
    image: nightImage,
    alt: "Cat relaxing at night while listening to music",
    mood: "night",
  },
];


// Play Song based on Mood
const handlePlay = async (slide: HeroSlide) => {
  if (isLoading.value) {
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const tracks =
      await getTracksForMood(
        slide.mood
      );

    if (!tracks.length) {
      errorMessage.value =
        "No tracks are available right now.";
      return;
    }

    await playTracks(
      tracks,
      0
    );

  } catch (error) {
    console.error("Failed to load hero tracks:", error);

    errorMessage.value = "Music could not be loaded. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

// Pagination
const renderBullet = ( index: number, className: string ) => `
  <button
    class="${className}"
    type="button"
    aria-label="Go to featured music slide ${index + 1}"
  ></button>
`;
</script>


<style scoped>
.hero-swiper {
  --swiper-navigation-color: #fd7179;
  --swiper-pagination-color: #fd7179;
  width: 100%;
}

/* Navigation controls */
.hero-swiper :deep(.swiper-button-next),
.hero-swiper :deep(.swiper-button-prev) {
  width: 44px;
  height: 44px;
}

.hero-swiper :deep(.swiper-button-next::after),
.hero-swiper :deep(.swiper-button-prev::after) {
  font-size: 20px;
  font-weight: 700;
}

/* Keyboard focus styles */
.hero-swiper :deep(.swiper-button-next:focus-visible),
.hero-swiper :deep(.swiper-button-prev:focus-visible),
.hero-swiper :deep(.swiper-pagination-bullet:focus-visible) {
  outline: 2px solid #fd7179;
  outline-offset: 3px;
}

/* Pagination */
.hero-swiper :deep(.swiper-pagination-bullet) {
  position: relative;
  width: 24px;
  height: 24px;
  margin: 0 2px !important;
  background: transparent;
  opacity: 1;
}

.hero-swiper :deep(.swiper-pagination-bullet::after) {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: #f9a8d4;
  opacity: 0.5;
  transform: translate(-50%, -50%);
}

.hero-swiper :deep(.swiper-pagination-bullet-active::after) {
  background: #fd7179;
  opacity: 1;
}

/* Mobile */
@media (max-width: 640px) {
  .hero-swiper :deep(.swiper-button-next),
  .hero-swiper :deep(.swiper-button-prev) {
    display: none;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .hero-swiper,
  .hero-swiper *,
  .hero-swiper *::before,
  .hero-swiper *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}

</style>