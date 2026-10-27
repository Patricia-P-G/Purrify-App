<template>
  <!-- Login Page -->
  <main class="relative min-h-screen w-full overflow-hidden bg-background">
    <!-- Mobile Background -->
    <img src="@/assets/images/login-picture.webp" alt="" aria-hidden="true" class="pointer-events-none absolute inset-0 h-full w-full
     object-cover lg:hidden"
    />

    <div class="pointer-events-none absolute inset-0 bg-[#F9C9CE]/55 backdrop-blur-[3px] lg:hidden"></div>

    <div class="relative z-10 flex min-h-screen w-full">
      <!-- Left Side -->
      <section class="relative hidden min-h-screen w-[48%] overflow-hidden lg:block">
        <img src="@/assets/images/login-picture.webp" alt="" aria-hidden="true"class="absolute inset-0 h-full w-full object-cover"/>

        <!-- Logo and Slogan -->
        <div class="relative z-10 flex flex-col px-12 py-8">
          <!-- Logo -->
          <img src="@/assets/icons/purrify-logo.svg" alt="Purrify" class="w-44"/>

          <!-- Slogan -->
          <div class="ml-3 mt-7">
            <h1 class="text-3xl font-semibold xl:text-[50px]">
              <span class="block text-primary-text">Your music</span>
              <span class="block text-primary">Your mood</span>
            </h1>

            <p class="mt-3 max-w-70 text-base leading-relaxed text-[#5F6078] xl:text-lg">
              A purr-fect place to listen, explore and feel at home. ♡
            </p>
          </div>
        </div>
      </section>

      <!-- Right Side -->
      <section class="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-transparent px-4 py-10
       sm:px-8 lg:w-[52%] lg:bg-linear-to-br lg:from-[#FFE5EE] lg:via-[#FBC7D9] lg:to-[#F4AFCB] lg:px-10">
        
       <!-- Background Glow -->
        <div class="pointer-events-none absolute -right-28 -top-28 hidden h-96 w-96 rounded-full bg-white/50 blur-3xl lg:block"></div>

        <div class="pointer-events-none absolute -bottom-32 -left-24 hidden h-96 w-96 rounded-full bg-[#FF8FB8]/30 blur-3xl lg:block"></div>

        <!-- Decorative Lines -->
        <div class="pointer-events-none absolute -bottom-44 -left-28 hidden h-96 w-96 rounded-full border-2 border-white/35 lg:block"></div>
        <div class="pointer-events-none absolute -right-52 -top-40 hidden h-125 w-125 rounded-full border-2 border-white/30 lg:block"></div>

        <!-- Login Card -->
        <div class="relative z-10 w-full max-w-137.5 rounded-[40px] border border-white/80 bg-white px-6 py-12
         shadow-[0_25px_80px_rgba(168,63,98,0.15)] sm:px-12 sm:py-14 xl:px-14 xl:py-16">

          <!-- Welcome -->
          <div class="flex flex-col items-center text-center">
            <!-- Cat Icon -->
            <div class="mb-8 flex h-28 w-28 items-center justify-center rounded-full border-10 border-[#FFF5F8] bg-[#FCE4ED]
             shadow-[0_8px_30px_rgba(168,63,98,0.08)]">
              <img src="/purrify-cat-icon.svg" alt="" aria-hidden="true" class="h-20 w-20 object-contain"/>
            </div>

            <!-- Heading -->
            <h2 class="text-[30px] font-bold leading-tight text-primary-text sm:text-[36px]">
              Welcome to Purrify!
            </h2>

            <!-- Description -->
            <p class="mt-6 max-w-md text-sm leading-7 text-text-secondary sm:text-base">
              Connect your Spotify account to listen, explore, and create your own cozy music space.
            </p>
          </div>

          <!-- Spotify Connection -->
          <div class="mt-12">
            <button type="button" :disabled="isConnecting" :aria-busy="isConnecting" class="flex w-full cursor-pointer items-center 
             justify-center gap-3 rounded-full bg-[#00CC59] px-5 py-4 text-base font-semibold text-white
             shadow-[0_10px_30px_rgba(0,204,89,0.22)] transition-all duration-200 hover:bg-[#1DB954]
             hover:shadow-[0_14px_35px_rgba(0,204,89,0.30)] focus-visible:outline-2 focus-visible:outline-offset-4
             focus-visible:outline-[#00CC59] disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none"
              @click="handleSpotifyLogin">

              <!-- Spotify Icon -->
              <img src="@/assets/icons/spotify.svg" alt="" aria-hidden="true" class="h-7.5 w-7.5 brightness-0 invert"/>

              <span>
                {{ isConnecting ? "Connecting..." : "Connect with Spotify" }}
              </span>
            </button>

            <!-- Security Message -->
            <p class="mt-5 text-center text-xs leading-relaxed text-text-secondary sm:text-sm">
              You'll log in securely on Spotify.
            </p>

            <!-- Spotify Error -->
            <p v-if="loginError" class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700" role="alert">
              {{ loginError }}
            </p>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>


<script setup lang="ts">
import { ref } from "vue";
import { useHead } from "@unhead/vue";
import { redirectToSpotify } from "@/services/spotify/auth";

const isConnecting = ref(false);
const loginError = ref("");

// SEO
useHead({
  title: "Connect with Spotify | Purrify",
  meta: [
    {
      name: "description",
      content:
        "Connect your Spotify account to Purrify to discover music, explore your favorite artists, and enjoy your own cozy music space.",
    },
    {
      name: "robots",
      content: "noindex, follow",
    },
    {
      property: "og:title",
      content: "Connect with Spotify | Purrify",
    },
    {
      property: "og:description",
      content:
        "Connect your Spotify account and start exploring music with Purrify.",
    },
    {
      property: "og:type",
      content: "website",
    },
  ],
});

// Spotify Login
const handleSpotifyLogin = async () => {
  if (isConnecting.value) return;

  loginError.value = "";
  isConnecting.value = true;

  try {
    await redirectToSpotify();
  } catch (error) {
    console.error("Spotify login failed:", error);
    loginError.value = "Could not connect to Spotify. Please try again.";
    isConnecting.value = false;
  }
};

</script>