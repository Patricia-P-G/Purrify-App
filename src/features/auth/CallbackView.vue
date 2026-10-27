<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { getToken } from "@/services/spotify/auth";
import { initializeSpotifyPlayer } from "@/services/spotify/spotifyPlayer";
import { loginWithAppwrite } from "@/services/appwrite/auth";

const router = useRouter();

// Spotify Authentication Callback
onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");

  // Redirect if Authorization Code is Missing
  if (!code) {
    await router.replace("/");
    return;
  }

  try {
    // Exchange Spotify Code for Access Token
    const tokenData = await getToken(code);

    // Authenticate Spotify User with Appwrite
    await loginWithAppwrite(tokenData.access_token);

    // Initialize Spotify Player
    initializeSpotifyPlayer();

    // Redirect to Home Page
    await router.replace("/home");
  } catch (error) {
    // Handle Authentication Errors
    console.error("Spotify callback failed:", error);
    await router.replace("/");
  }
});
</script>

<template>
  <!-- Spotify Callback Page -->
  <main class="flex min-h-screen items-center justify-center bg-background">
    <p class="text-text-secondary" role="status" aria-live="polite">
      Connecting to Purrify...
    </p>
  </main>
</template>