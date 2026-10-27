import { ref } from "vue";

export type ToastType =
  | "favorite"
  | "track"
  | "playlist";

export type ToastAction =
  | "added"
  | "removed"
  | "created"
  | "updated"
  | "deleted";

// Shared Toast State
const showToast = ref(false);

const toastType =
  ref<ToastType>("favorite");

const toastAction =
  ref<ToastAction>("added");

const toastTrackName = ref("");

const toastPlaylistName = ref("");

let toastTimer:
  ReturnType<typeof setTimeout> | null = null;

export function useActionToast() {
  // Triggers Toast
  const triggerToast = ({
    type,
    action,
    trackName = "",
    playlistName = "",
  }: {
    type: ToastType;
    action: ToastAction;
    trackName?: string;
    playlistName?: string;
  }) => {
    if (toastTimer) {
      clearTimeout(toastTimer);
      toastTimer = null;
    }

    toastType.value = type;
    toastAction.value = action;

    toastTrackName.value =
      trackName;

    toastPlaylistName.value =
      playlistName;

    showToast.value = true;

    toastTimer = setTimeout(() => {
      showToast.value = false;
      toastTimer = null;
    }, 3000);
  };

  // Closes Toast
  const closeToast = () => {
    showToast.value = false;

    if (toastTimer) {
      clearTimeout(toastTimer);
      toastTimer = null;
    }
  };

  return {
    showToast,
    toastType,
    toastAction,
    toastTrackName,
    toastPlaylistName,
    triggerToast,
    closeToast,
  };
}