<template>
  <!-- Desktop Music Player -->
  <section v-if="currentTrack" class="fixed bottom-0 left-0 right-0 z-50 hidden border-t border-primary-light bg-background/95 px-8 py-5
   shadow-[0_-8px_30px_rgba(75,75,85,0.10)] backdrop-blur-md lg:block" aria-label="Music player">
    <div class="mx-auto grid max-w-[1600px] grid-cols-[1fr_1.4fr_1fr] items-center gap-8">
      <!-- Song Content -->
      <div class="flex min-w-0 items-center gap-3">
        <img :src="currentTrack.image" alt="" width="56" height="56" decoding="async"
         class="h-14 w-14 shrink-0 rounded-xl object-cover shadow-sm"/>

        <div class="min-w-0">
          <h2 class="truncate text-base font-semibold text-primary-text">
            {{ currentTrack.title }}
          </h2>

          <div class="mt-0.5 flex min-w-0 items-center overflow-hidden whitespace-nowrap text-sm text-text-muted">
            <template v-for="(artist, index) in trackArtists" :key="`${artist.name}-${index}`">
              <span v-if="index > 0" class="mr-1">,</span>
              <button v-if="artist.id" type="button"
               class="shrink-0 cursor-pointer hover:underline hover:underline-offset-2 focus-visible:rounded-sm
               focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
               @click="openArtist(artist.id)">
                {{ artist.name }}
              </button>
              <span v-else class="shrink-0">{{ artist.name }}</span>
            </template>
          </div>
        </div>

        <!-- Favorite Button -->
        <button type="button" :aria-label="isFavorite(currentTrack.id) ? `Remove ${currentTrack.title} from favorites` : `Add ${currentTrack.title} to favorites`"
         :aria-pressed="isFavorite(currentTrack.id)"
         class="ml-1 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform duration-200
         hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
         active:scale-95 motion-reduce:transform-none motion-reduce:transition-none" @click="handleFavoriteClick(currentTrack)">
          <img :src="isFavorite(currentTrack.id) ? favoriteActiveIcon : favoriteIcon"
           alt="" aria-hidden="true" width="20" height="20" class="h-5 w-5"/>
        </button>
      </div>

      <!-- Player Controls -->
      <div class="flex min-w-0 flex-col items-center justify-center">
        <div class="flex items-center justify-center gap-5">
          <button type="button" aria-label="Previous track" :disabled="!hasMultipleTracks"
           class="group/previous flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-text-secondary transition hover:bg-primary-light
           hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95
           disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transform-none motion-reduce:transition-none" @click="previousTrack">
            <span class="relative block h-5 w-5" aria-hidden="true">
              <img src="@/assets/icons/skip-back.svg" alt="" width="20" height="20" class="block h-5 w-5 group-hover/previous:hidden"/>
              <img src="@/assets/icons/skip-back-hover.svg" alt="" width="20" height="20" class="hidden h-5 w-5 group-hover/previous:block"/>
            </span>
          </button>

          <button type="button" :aria-label="isPlaying ? 'Pause' : 'Play'" :aria-pressed="isPlaying"
           class="group cursor-pointer rounded-full transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2
           focus-visible:outline-primary active:scale-95 motion-reduce:transform-none motion-reduce:transition-none" @click="togglePlay">
            <PlayButton :active="true" :playing="isPlaying" size="md"/>
          </button>

          <button type="button" aria-label="Next track" :disabled="!hasMultipleTracks"
           class="group/next flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-text-secondary transition hover:bg-primary-light
           hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95
           disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transform-none motion-reduce:transition-none" @click="nextTrack">
            <span class="relative block h-5 w-5" aria-hidden="true">
              <img src="@/assets/icons/skip-forward.svg" alt="" width="20" height="20" class="block h-5 w-5 group-hover/next:hidden"/>
              <img src="@/assets/icons/skip-forward-hover.svg" alt="" width="20" height="20" class="hidden h-5 w-5 group-hover/next:block"/>
            </span>
          </button>
        </div>

        <!-- Progress -->
        <div class="mt-3 flex w-full max-w-sm items-center gap-2">
          <span class="w-9 text-right text-[11px] text-text-muted">
            {{ formatDuration(spotifyPosition) }}
          </span>

          <div class="relative h-1.5 flex-1 cursor-pointer rounded-full bg-primary-light focus-visible:outline-2
           focus-visible:outline-offset-4 focus-visible:outline-primary" role="slider" tabindex="0" aria-label="Song progress"
           :aria-valuemin="0" :aria-valuemax="spotifyDuration" :aria-valuenow="spotifyPosition"
           :aria-valuetext="`${formatDuration(spotifyPosition)} of ${formatDuration(spotifyDuration)}`"
           @click="seekTrack" @keydown.left.prevent="seekBy(-5000)" @keydown.right.prevent="seekBy(5000)">
            <div class="h-full rounded-full bg-primary" :style="{ width: `${progressPercentage}%` }"></div>
          </div>

          <span class="w-9 text-[11px] text-text-muted">
            {{ formatDuration(spotifyDuration) }}
          </span>
        </div>
      </div>

      <!-- Volume and Close -->
      <div class="flex items-center justify-end gap-3">
        <div class="flex items-center gap-2">
          <button type="button" :aria-label="volume === 0 ? 'Unmute' : 'Mute'" :aria-pressed="volume === 0"
           class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-primary transition hover:bg-primary-light
           focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95
           motion-reduce:transform-none motion-reduce:transition-none" @click="toggleMute">
            <img v-if="volume === 0" src="@/assets/icons/volume-mute.svg" alt="" class="h-5 w-5" aria-hidden="true"/>
            <img v-else src="@/assets/icons/volume.svg" alt="" class="h-5 w-5" aria-hidden="true"/>
          </button>

          <input v-model.number="volume" type="range" min="0" max="100" step="1" aria-label="Volume"
           class="volume-slider w-24 cursor-pointer" :style="{ '--volume-progress': `${volume}%` }" @input="changeVolume"/>
        </div>

        <button type="button" aria-label="Close music player"
         class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-text-muted transition hover:bg-primary-light
         hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95
         motion-reduce:transform-none motion-reduce:transition-none" @click="closePlayer">
          <img src="@/assets/icons/close.svg" alt="" aria-hidden="true" width="20" height="20" class="h-5 w-5"/>
        </button>
      </div>
    </div>
  </section>

  <!-- Mobile Mini Player -->
  <section v-if="currentTrack && !isMobilePlayerOpen" class="fixed bottom-16 left-0 right-0 z-40 border-t border-primary-light
   bg-background/95 px-3 py-2.5 shadow-[0_-8px_30px_rgba(75,75,85,0.12)] backdrop-blur-md md:bottom-0 md:left-24 md:px-5 lg:hidden"
   aria-label="Music player">
    <div class="flex min-w-0 items-end gap-3">
      <div class="flex min-w-0 flex-1 items-center gap-3">
        <button type="button" class="shrink-0 cursor-pointer rounded-xl focus-visible:outline-2 focus-visible:outline-primary"
         aria-label="Open now playing" @click="isMobilePlayerOpen = true">
          <img :src="currentTrack.image" alt="" width="48" height="48" decoding="async"
           class="h-12 w-12 rounded-xl object-cover shadow-sm"/>
        </button>

        <div class="min-w-0 flex-1">
          <button type="button" class="block max-w-full cursor-pointer truncate text-left text-sm font-semibold text-primary-text
           focus-visible:outline-2 focus-visible:outline-primary" @click="isMobilePlayerOpen = true">
            {{ currentTrack.title }}
          </button>

          <div class="mt-0.5 flex min-w-0 items-center overflow-hidden whitespace-nowrap text-xs text-text-muted">
            <template v-for="(artist, index) in trackArtists" :key="`${artist.name}-${index}`">
              <span v-if="index > 0" class="mr-1">,</span>
              <button v-if="artist.id" type="button"
               class="shrink-0 cursor-pointer hover:underline hover:underline-offset-2 focus-visible:rounded-sm
               focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
               @click="openArtist(artist.id)">
                {{ artist.name }}
              </button>
              <span v-else class="shrink-0">{{ artist.name }}</span>
            </template>
          </div>
        </div>
      </div>

      <button type="button" :aria-label="isFavorite(currentTrack.id) ? `Remove ${currentTrack.title} from favorites` : `Add ${currentTrack.title} to favorites`"
       :aria-pressed="isFavorite(currentTrack.id)"
       class="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform duration-200 hover:scale-110
       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95
       motion-reduce:transform-none motion-reduce:transition-none" @click="handleFavoriteClick(currentTrack)">
        <img :src="isFavorite(currentTrack.id) ? favoriteActiveIcon : favoriteIcon" alt="" aria-hidden="true"
         width="20" height="20" class="h-5 w-5"/>
      </button>

      <button type="button" :aria-label="isPlaying ? 'Pause' : 'Play'" :aria-pressed="isPlaying"
       class="group shrink-0 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
       active:scale-95 motion-reduce:transform-none" @click="togglePlay">
        <PlayButton :active="true" :playing="isPlaying" size="md"/>
      </button>
    </div>

    <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-light" aria-hidden="true">
      <div class="h-full bg-primary" :style="{ width: `${progressPercentage}%` }"></div>
    </div>
  </section>

  <!-- Mobile Full Player -->
  <section v-if="currentTrack && isMobilePlayerOpen"
   class="fixed inset-0 z-100 flex flex-col overflow-hidden bg-background px-5 pb-8 pt-5 lg:hidden" aria-label="Now playing">
    <header class="flex shrink-0 items-center justify-between">
      <div class="h-11 w-11 shrink-0" aria-hidden="true"></div>

      <div class="min-w-0 flex-1 px-3 text-center">
        <p class="text-[11px] font-medium uppercase tracking-[0.16em] text-text-muted">
          Now playing
        </p>
        <p class="mt-0.5 truncate text-sm font-semibold text-primary-text">
          {{ currentTrack.title }}
        </p>
      </div>

      <button type="button" aria-label="Close now playing"
       class="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-text-muted transition hover:bg-primary-light
       hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-90
       motion-reduce:transform-none motion-reduce:transition-none" @click="isMobilePlayerOpen = false">
        <img src="@/assets/icons/close.svg" alt="" aria-hidden="true" width="20" height="20" class="h-5 w-5"/>
      </button>
    </header>

    <!-- Album Cover -->
    <div class="flex min-h-0 flex-1 items-center justify-center py-6">
      <img :src="currentTrack.largeImage || currentTrack.image" :alt="`${currentTrack.album} album cover`" width="360" height="360" decoding="async"
       class="aspect-square w-full max-w-90 rounded-[28px] object-cover shadow-[0_20px_55px_rgba(75,75,85,0.18)]"/>
    </div>

    <!-- Song Controls -->
    <div class="mx-auto w-full max-w-md shrink-0">
      <div class="flex items-center gap-4">
        <div class="min-w-0 flex-1">
          <h1 class="truncate text-xl font-semibold text-primary-text">
            {{ currentTrack.title }}
          </h1>

          <div class="mt-1 flex min-w-0 items-center overflow-hidden whitespace-nowrap text-sm text-text-muted">
            <template v-for="(artist, index) in trackArtists" :key="`${artist.name}-${index}`">
              <span v-if="index > 0" class="mr-1">,</span>
              <button v-if="artist.id" type="button"
               class="shrink-0 cursor-pointer hover:underline hover:underline-offset-2 focus-visible:rounded-sm
               focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
               @click="openArtist(artist.id)">
                {{ artist.name }}
              </button>
              <span v-else class="shrink-0">{{ artist.name }}</span>
            </template>
          </div>
        </div>

        <button type="button" :aria-label="isFavorite(currentTrack.id) ? `Remove ${currentTrack.title} from favorites` : `Add ${currentTrack.title} to favorites`"
         :aria-pressed="isFavorite(currentTrack.id)"
         class="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform duration-200 hover:scale-110
         focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-90
         motion-reduce:transform-none motion-reduce:transition-none" @click="handleFavoriteClick(currentTrack)">
          <img :src="isFavorite(currentTrack.id) ? favoriteActiveIcon : favoriteIcon" alt="" aria-hidden="true"
           width="24" height="24" class="h-6 w-6"/>
        </button>
      </div>

      <!-- Progress -->
      <div class="mt-6">
        <div class="relative h-2 w-full cursor-pointer rounded-full bg-primary-light focus-visible:outline-2
         focus-visible:outline-offset-4 focus-visible:outline-primary" role="slider" tabindex="0" aria-label="Song progress"
         :aria-valuemin="0" :aria-valuemax="spotifyDuration" :aria-valuenow="spotifyPosition"
         :aria-valuetext="`${formatDuration(spotifyPosition)} of ${formatDuration(spotifyDuration)}`"
         @click="seekTrack" @keydown.left.prevent="seekBy(-5000)" @keydown.right.prevent="seekBy(5000)">
          <div class="h-full rounded-full bg-primary" :style="{ width: `${progressPercentage}%` }"></div>
          <span class="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-sm"
           :style="{ left: `${progressPercentage}%` }" aria-hidden="true"></span>
        </div>

        <div class="mt-2 flex items-center justify-between text-xs text-text-muted">
          <span>{{ formatDuration(spotifyPosition) }}</span>
          <span>{{ formatDuration(spotifyDuration) }}</span>
        </div>
      </div>

      <!-- Controls -->
      <div class="mt-5 flex items-center justify-center gap-8">
        <button type="button" aria-label="Previous track" :disabled="!hasMultipleTracks"
         class="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-text-secondary transition
         hover:bg-primary-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-90
         disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transform-none motion-reduce:transition-none" @click="previousTrack">
          <img src="@/assets/icons/skip-back.svg" alt="" width="24" height="24" class="h-6 w-6" aria-hidden="true"/>
        </button>

        <button type="button" :aria-label="isPlaying ? 'Pause' : 'Play'" :aria-pressed="isPlaying"
         class="group cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
         active:scale-95 motion-reduce:transform-none" @click="togglePlay">
          <PlayButton :active="true" :playing="isPlaying" size="lg"/>
        </button>

        <button type="button" aria-label="Next track" :disabled="!hasMultipleTracks"
         class="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-text-secondary transition
         hover:bg-primary-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-90
         disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transform-none motion-reduce:transition-none" @click="nextTrack">
          <img src="@/assets/icons/skip-forward.svg" alt="" width="24" height="24" class="h-6 w-6" aria-hidden="true"/>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { usePlayer } from "@/composables/usePlayer";
import { useFavoriteActions } from "@/composables/useFavoritesActions";
import { spotifyPosition, spotifyDuration, seekSpotifyPlayback, setSpotifyVolume } from "@/services/spotify/spotifyPlayer";
import PlayButton from "@/components/music/PlayButton.vue";
import favoriteIcon from "@/assets/icons/favorites.svg";
import favoriteActiveIcon from "@/assets/icons/favorites-hover.svg";
import { formatDuration } from "@/utils/format";

const { currentTrack, isPlaying, hasMultipleTracks, togglePlay, nextTrack, previousTrack, closePlayer } = usePlayer();
const { isFavorite, handleFavoriteClick } = useFavoriteActions();

const isMobilePlayerOpen = ref(false);
const volume = ref(50);
const previousVolume = ref(50);

const router = useRouter();

// Opens Artist Page
const openArtist = async (artistId: string) => {
  isMobilePlayerOpen.value = false;

  await router.push({
    name: "artist",
    params: { id: artistId },
  });
};

type ArtistLink = { name: string; id?: string };

const trackArtists = computed<ArtistLink[]>(() => {
  const track = currentTrack.value;
  if (!track) return [];

  const names = track.artist.split(/,\s*/).map((name) => name.trim()).filter(Boolean);
  const artistData = (track as typeof track & { artists?: Array<{ id?: string; name?: string } | string> }).artists;

  return names.map((name, index) => {
    const match = artistData?.find(
      (artist) => typeof artist !== "string" && artist.name?.toLowerCase() === name.toLowerCase()
    );

    const matchingId = match && typeof match !== "string" ? match.id : undefined;
    const indexed = artistData?.[index];
    const indexedId = indexed && typeof indexed !== "string" && indexed.name === name ? indexed.id : undefined;

    return {
      name,
      id: matchingId || indexedId || (index === 0 ? track.artistId : undefined)
    };
  });
});


// Calculates the current song progress
const progressPercentage = computed(() => {
  if (!spotifyDuration.value) return 0;
  return Math.min((spotifyPosition.value / spotifyDuration.value) * 100, 100);
});

// Changes Spotify volume
const changeVolume = async () => {
  if (volume.value > 0) previousVolume.value = volume.value;

  try {
    await setSpotifyVolume(volume.value / 100);
  } catch (error) {
    console.error("Failed to change Spotify volume:", error);
  }
};

// Mutes or restores the previous volume
const toggleMute = async () => {
  try {
    if (volume.value > 0) {
      previousVolume.value = volume.value;
      volume.value = 0;
      await setSpotifyVolume(0);
      return;
    }

    volume.value = previousVolume.value;
    await setSpotifyVolume(previousVolume.value / 100);
  } catch (error) {
    console.error("Failed to toggle Spotify mute:", error);
  }
};

// Seeks to the clicked position
const seekTrack = async (event: MouseEvent) => {
  if (!spotifyDuration.value) return;

  const progressBar = event.currentTarget as HTMLElement;
  const rect = progressBar.getBoundingClientRect();
  const percentage = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
  const newPosition = percentage * spotifyDuration.value;

  try {
    await seekSpotifyPlayback(newPosition);
    spotifyPosition.value = newPosition;
  } catch (error) {
    console.error("Failed to seek Spotify track:", error);
  }
};

// Seeks backward or forward with the keyboard
const seekBy = async (amount: number) => {
  if (!spotifyDuration.value) return;

  const newPosition = Math.min(Math.max(spotifyPosition.value + amount, 0), spotifyDuration.value);

  try {
    await seekSpotifyPlayback(newPosition);
    spotifyPosition.value = newPosition;
  } catch (error) {
    console.error("Failed to seek Spotify track:", error);
  }
};

</script>

<style scoped>
.volume-slider {
  height: 5px;
  appearance: none;
  border-radius: 9999px;
  background: linear-gradient(
    to right,
    var(--color-primary) 0%,
    var(--color-primary) var(--volume-progress),
    var(--color-primary-light) var(--volume-progress),
    var(--color-primary-light) 100%
  );
  outline: none;
}

.volume-slider:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 4px;
}

.volume-slider::-webkit-slider-thumb {
  width: 14px;
  height: 14px;
  appearance: none;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
}

.volume-slider::-moz-range-track {
  height: 5px;
  border-radius: 9999px;
  background: var(--color-primary-light);
}

.volume-slider::-moz-range-progress {
  height: 5px;
  border-radius: 9999px;
  background: var(--color-primary);
}

.volume-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border: none;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
}

</style>