<template>
  <div ref="dropdownRef" class="relative">
    <!-- Avatar Button -->
    <button ref="profileButtonRef" type="button" aria-label="Open profile menu" aria-controls="profile-dropdown"
      :aria-expanded="isOpen" @keydown="handleButtonKeydown"
      class="flex cursor-pointer items-center justify-center rounded-full transition duration-200 hover:scale-105
      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-95
      motion-reduce:transform-none motion-reduce:transition-none"
      @click="toggleDropdown">

      <!-- Spotify Profile Picture -->
      <img v-if="profileImage" :src="profileImage" alt="" decoding="async" width="44" height="44"
        class="h-11 w-11 rounded-full object-cover shadow-sm"/>

      <!-- Placeholder Avatar -->
      <div v-else class="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light" aria-hidden="true">
        <img src="@/assets/icons/user.svg" alt="" class="h-5 w-5" aria-hidden="true"/>
      </div>
    </button>

    <!-- Dropdown -->
    <div v-if="isOpen" id="profile-dropdown"
      class="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-3xl border border-primary bg-background/95
      shadow-[0_15px_40px_rgba(168,63,98,0.18)] backdrop-blur-xl">

      <!-- User Information -->
      <div class="flex items-center gap-3 bg-primary-light/70 px-5 py-4">
        <!-- Spotify Profile Picture -->
        <img v-if="profileImage" :src="profileImage" alt="" decoding="async" width="40" height="40"
          class="h-10 w-10 rounded-full object-cover shadow-sm"
        />

        <!-- Placeholder Avatar -->
        <div v-else class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background"
          aria-hidden="true">
          <img src="@/assets/icons/user.svg" alt="" class="h-5 w-5" aria-hidden="true"/>
        </div>

        <!-- Profile Information -->
        <div class="min-w-0">
          <p class="truncate font-semibold text-primary-text">
            {{ profileName }}
          </p>
          <p class="text-xs font-medium text-primary">
            User
          </p>
        </div>
      </div>

      <!-- Log Out -->
      <div class="border-t border-border-pink p-3">
        <button type="button" class="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold
          text-primary transition duration-200 hover:bg-primary-light focus-visible:outline-2 focus-visible:outline-offset-2
          focus-visible:outline-primary active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none"
          @click="handleLogout">

          <img src="@/assets/icons/log-out.svg" alt="" class="h-5 w-5" aria-hidden="true"/>
          <span>Log out</span>
        </button>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { AppwriteException } from "appwrite";
import { account } from "@/services/appwrite/client";
import { useFavorites } from "@/composables/useFavorites";
import { usePlaylists } from "@/composables/usePlaylists";

defineProps<{
  profileImage: string;
  profileName: string;
}>();

const router = useRouter();
const route = useRoute();

const { resetFavorites } = useFavorites();
const { resetPlaylists } = usePlaylists();

// Dropdown State
const isOpen = ref(false);
const isLoggingOut = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const profileButtonRef = ref<HTMLButtonElement | null>(null);

// Opens or Closes the Dropdown
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

// Closes the Dropdown
const closeDropdown = () => {
  isOpen.value = false;
};

// Closes the Dropdown When Clicking Outside
const handleClickOutside = (event: MouseEvent) => {
  if (
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target as Node)
  ) {
    closeDropdown();
  }
};

// Closes the Dropdown with Escape
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key !== "Escape" || !isOpen.value) return;

  closeDropdown();
  profileButtonRef.value?.focus();
};

// Focuses the First Link When Opened with the Keyboard
const handleButtonKeydown = async (event: KeyboardEvent) => {
  if (event.key !== "ArrowDown") return;

  event.preventDefault();
  isOpen.value = true;

  await nextTick();
  dropdownRef.value
  ?.querySelector<HTMLButtonElement>("#profile-dropdown button")
  ?.focus();
};

// Closes the Dropdown When Navigating
watch(() => route.fullPath, closeDropdown);

// Logs Out of Spotify and Appwrite
const handleLogout = async () => {
  if (isLoggingOut.value) return;

  isLoggingOut.value = true;

  try {
    // End the Current Appwrite Session
    try {
      await account.deleteSession({
        sessionId: "current",
      });
    } catch (error) {
      // Ignore Missing or Expired Sessions
      if (
        !(error instanceof AppwriteException) ||
        error.code !== 401
      ) {
        throw error;
      }
    }

    // Clear Spotify Authentication Tokens
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token_expires_at");
    localStorage.removeItem("code_verifier");

    // Clear User-Specific Local State
    resetFavorites();
    resetPlaylists();

    // Close Dropdown and Redirect
    closeDropdown();
    await router.replace("/");
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    isLoggingOut.value = false;
  }
};

// Event Listeners
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleKeydown);
});

</script>