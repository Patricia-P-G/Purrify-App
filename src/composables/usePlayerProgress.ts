import { computed } from "vue";
import { spotifyPosition, spotifyDuration, seekSpotifyPlayback } from "@/services/spotify/spotifyPlayer";
import { formatDuration } from "@/utils/format";

// Shared progress and seeking logic for every music player layout
export function usePlayerProgress() {
  const progressPercentage = computed(() => {
    if (!spotifyDuration.value) return 0;
    return Math.min((spotifyPosition.value / spotifyDuration.value) * 100, 100);
  });

  const formattedPosition = computed(() => formatDuration(spotifyPosition.value));
  const formattedDuration = computed(() => formatDuration(spotifyDuration.value));

  // Seeks to a position (in milliseconds), kept inside the song length
  const seekTo = async (position: number) => {
    if (!spotifyDuration.value) return;

    const newPosition = Math.min(Math.max(position, 0), spotifyDuration.value);

    try {
      await seekSpotifyPlayback(newPosition);
      spotifyPosition.value = newPosition;
    } catch (error) {
      console.error("Failed to seek Spotify track:", error);
    }
  };

  // Seeks to the clicked position on a progress bar
  const seekToClick = (event: MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const percentage = (event.clientX - rect.left) / rect.width;
    return seekTo(percentage * spotifyDuration.value);
  };

  // Seeks backward or forward, used by the keyboard controls
  const seekBy = (amount: number) => seekTo(spotifyPosition.value + amount);

  return {
    position: spotifyPosition,
    duration: spotifyDuration,
    progressPercentage,
    formattedPosition,
    formattedDuration,
    seekToClick,
    seekBy,
  };
}