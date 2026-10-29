import { ref } from "vue";

// Runs a playback action one at a time and keeps an error message for the UI
export function usePlaybackAction() {
  const isPending = ref(false);
  const error = ref("");

  const run = async (action: () => Promise<void>, failMessage: string) => {
    // Prevent overlapping playback requests
    if (isPending.value) return;

    isPending.value = true;
    error.value = "";

    try {
      await action();
    } catch (err) {
      console.error(failMessage, err);
      error.value = failMessage;
    } finally {
      isPending.value = false;
    }
  };

  return { isPending, error, run };
}
