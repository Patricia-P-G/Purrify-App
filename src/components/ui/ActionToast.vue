<template>
  <Transition enter-active-class="transition duration-300 ease-out motion-reduce:transition-none"
   enter-from-class="translate-y-4 opacity-0 motion-reduce:translate-y-0" enter-to-class="translate-y-0 opacity-100"
   leave-active-class="transition duration-200 ease-in motion-reduce:transition-none"
   leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-4 opacity-0 motion-reduce:translate-y-0">
    <div v-if="show" class="fixed bottom-6 left-1/2 z-9999 flex w-[calc(100%-2rem)] max-w-125 -translate-x-1/2 items-center
     gap-4 overflow-hidden rounded-2xl border border-border bg-surface p-4 pb-5 shadow-[0_12px_35px_rgba(75,75,85,0.20)] sm:w-125"
     role="status" aria-live="polite">
      <!-- Toast Icon -->
      <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-light" aria-hidden="true">
        <img :src="toastContent.icon" alt="" width="28" height="28" class="h-7 w-7"/>
      </div>

      <!-- Toast Information -->
      <div class="min-w-0 flex-1">
        <p class="font-semibold text-primary-text">
          {{ toastContent.title }}
        </p>
        <p class="mt-1 truncate text-sm text-text-muted">
          {{ toastContent.message }}
        </p>
      </div>

      <!-- Close Button -->
      <button type="button" class="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-text-muted transition
       hover:bg-primary-light hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"
       aria-label="Close notification" @click="emit('close')">
        <img src="@/assets/icons/close.svg" alt="" aria-hidden="true" width="16" height="16" class="h-4 w-4"/>
      </button>

      <!-- Toast Timer -->
      <div class="absolute bottom-0 left-0 h-1 w-full bg-surface-light" aria-hidden="true">
        <div :key="toastKey" class="toast-timer h-full bg-primary"></div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from "vue";
import favoriteIcon from "@/assets/icons/favorites.svg";
import favoriteHoverIcon from "@/assets/icons/favorites-hover.svg";
import playlistIcon from "@/assets/icons/playlists.svg";
import playlistHoverIcon from "@/assets/icons/playlists-hover.svg";

type ToastType = "favorite" | "track" | "playlist";
type ToastAction = "added" | "removed" | "created" | "updated" | "deleted";

const props = defineProps<{
  show: boolean;
  type: ToastType;
  action: ToastAction;
  trackName?: string;
  playlistName?: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

// Creates the icon, title and message for the toast
const toastContent = computed(() => {
  if (props.type === "favorite") {
    const added = props.action === "added";

    return {
      icon: added ? favoriteHoverIcon : favoriteIcon,
      title: added ? "Added to Favorites" : "Removed from Favorites",
      message: added
        ? `"${props.trackName}" has been added to your favorites`
        : `"${props.trackName}" was removed from your favorites`,
    };
  }

  if (props.type === "track") {
    const added = props.action === "added";

    return {
      icon: added ? playlistHoverIcon : playlistIcon,
      title: added ? "Added to Playlist" : "Removed from Playlist",
      message: added
        ? `"${props.trackName}" was added to playlist "${props.playlistName}"`
        : `"${props.trackName}" was removed from playlist "${props.playlistName}"`,
    };
  }

  const playlistContent = {
    created: {
      title: "Playlist Created",
      message: `Playlist "${props.playlistName}" was created`,
    },
    updated: {
      title: "Playlist Updated",
      message: `Playlist "${props.playlistName}" was updated`,
    },
    deleted: {
      title: "Playlist Deleted",
      message: `Playlist "${props.playlistName}" was deleted`,
    },
  };

  const content = playlistContent[props.action as keyof typeof playlistContent];

  return {
    icon: playlistIcon,
    title: content?.title ?? "Playlist",
    message: content?.message ?? "",
  };
});

// Restarts the timer when the toast changes
const toastKey = computed(() => {
  return `${props.type}-${props.action}-${props.trackName ?? ""}-${props.playlistName ?? ""}`;
});
</script>

<style scoped>
.toast-timer {
  width: 100%;
  transform: scaleX(0);
  transform-origin: left;
  animation: toastTimer 3s linear forwards;
}

@keyframes toastTimer {
  from {
    transform: scaleX(0);
  }

  to {
    transform: scaleX(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .toast-timer {
    animation: none;
    transform: scaleX(1);
  }
}

</style>