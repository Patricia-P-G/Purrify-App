<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import AsideNav from "@/components/layout/AsideNav.vue";
import NavBar from "@/components/layout/NavBar.vue";
import MusicPlayer from "@/components/music/MusicPlayer.vue";
import { onSpotifyTrackEnd } from "@/services/spotify/spotifyPlayer";
import { usePlayer } from "@/composables/usePlayer";
import { useScrollToTop } from "@/composables/useScrollToTop";
import { useFavorites } from "@/composables/useFavorites";
import { usePlaylists } from "@/composables/usePlaylists";
import { account } from "@/services/appwrite/client";

const route = useRoute();
const { nextTrack, currentTrack } = usePlayer();
const { loadFavorites } = useFavorites();
const { loadPlaylists } = usePlaylists();

// Pages Without the Main App Layout
const isAuthPage = computed(() => {
  return ["/", "/callback"].includes(route.path);
});

// Restore Saved Data After Refresh
const restoreUserData = async () => {
  try {
    // Verify Active Appwrite Session
    await account.get();

    // Restore Favorites and Playlists
    const results = await Promise.allSettled([
      loadFavorites(),
      loadPlaylists(),
    ]);

    results.forEach((result) => {
      if (result.status === "rejected") {
        console.error("Failed to restore user data:", result.reason);
      }
    });
  } catch {
    // No Active Session - Login Will Handle Authentication
  }
};

onMounted(() => {
  // Restore Saved Data When App Starts
  if (!isAuthPage.value) {
    void restoreUserData();
  }

  // Handle Spotify Track Ending
  onSpotifyTrackEnd(() => {
    nextTrack().catch((error) => {
      console.error("Failed to play next track:", error);
    });
  });
});

useScrollToTop();

</script>

<template>
  <!-- Login and Spotify Callback -->
  <RouterView v-if="isAuthPage" />

  <!-- Main Purrify App -->
  <div v-else  data-scroll-container class="min-h-screen flex-1 overflow-y-auto bg-[#fcd5d7]" :class="currentTrack ? 'pb-28 md:pb-24 xl:pb-32' : 'pb-0'">
    <AsideNav />

    <div class="transition-all duration-300 md:ml-24 lg:ml-64">
      <NavBar />

      <div class="p-4 pb-32 transition-all duration-300 sm:p-5 md:p-6">
        <RouterView />
      </div>
    </div>

    <MusicPlayer />
  </div>
</template>