import { computed, ref } from "vue";
import type { Track, RecentlyPlayedTrack } from "@/types/music";
import { playSpotifyTrack, toggleSpotifyPlayback, pauseSpotifyPlayback, spotifyPaused } from "@/services/spotify/spotifyPlayer";

// Track Used Inside the Player Queue
type QueueTrack = Track & {
  playedAt?: string;
};

// Describes Where the Current Queue Came From
export type PlayerSource = {
  type:
    | "track"
    | "recently-played"
    | "made-for-you"
    | "recommended"
    | "favorites"
    | "playlist"
    | "other";
  id?: string;
};

// Shared Queue
const queue = ref<QueueTrack[]>([]);

// Current Position in Queue
const currentIndex = ref(0);

// Where the Current Queue Came From
const playerSource = ref<PlayerSource | null>(null);

// Current Track
const currentTrack = computed(() => {
  return queue.value[currentIndex.value] ?? null;
});

// Unique Key for Current Track
const currentTrackKey = computed(() => {
  const track = currentTrack.value;

  if (!track) {
    return null;
  }

  return track.playedAt ?? track.id;
});

// Playback State
const isPlaying = computed(() => {
  return currentTrack.value !== null && !spotifyPaused.value;
});

// Checks Whether Queue Has Multiple Tracks
const hasMultipleTracks = computed(() => {
  return queue.value.length > 1;
});

// Starts Spotify Playback and Handles Errors
const startPlayback = async (track: QueueTrack) => {
  try {
    await playSpotifyTrack(track.uri);
  } catch (error) {
    console.error("Failed to play Spotify track:", error);
    throw error;
  }
};

export function usePlayer() {
  // Plays a Queue of Tracks
  const playTracks = async (
    tracks: QueueTrack[],
    startIndex = 0,
    source: PlayerSource = { type: "other" }
  ) => {
    if (!tracks.length) {
      return;
    }

    // Keeps the Starting Index Inside the Queue
    const safeIndex = Math.min(
      Math.max(startIndex, 0),
      tracks.length - 1
    );

    const track = tracks[safeIndex];

    if (!track) {
      return;
    }

    // Start Spotify Playback First
    await startPlayback(track);

    // Update Shared Player State After Success
    queue.value = [...tracks];
    currentIndex.value = safeIndex;
    playerSource.value = source;
  };

  // Plays One Track
  const playTrack = async (
    track: Track | RecentlyPlayedTrack,
    source: PlayerSource = { type: "track" }
  ) => {
    await playTracks([track as QueueTrack], 0, source);
  };

  // Toggles Play / Pause
  const togglePlay = async () => {
    if (!currentTrack.value) {
      return;
    }

    try {
      await toggleSpotifyPlayback();
    } catch (error) {
      console.error("Failed to toggle Spotify playback:", error);
      throw error;
    }
  };

  // Plays the Next Track
  const nextTrack = async () => {
    if (!hasMultipleTracks.value) {
      return;
    }

    // Wrap Around to the First Track
    const nextIndex =
      currentIndex.value < queue.value.length - 1
        ? currentIndex.value + 1
        : 0;

    const track = queue.value[nextIndex];

    if (!track) {
      return;
    }

    // Start Spotify Playback First
    await startPlayback(track);

    // Update Index Only After Playback Succeeds
    currentIndex.value = nextIndex;
  };

  // Plays the Previous Track
  const previousTrack = async () => {
    if (!hasMultipleTracks.value) {
      return;
    }

    // Wrap Around to the Last Track
    const previousIndex =
      currentIndex.value > 0
        ? currentIndex.value - 1
        : queue.value.length - 1;

    const track = queue.value[previousIndex];

    if (!track) {
      return;
    }

    // Start Spotify Playback First
    await startPlayback(track);

    // Update Index Only After Playback Succeeds
    currentIndex.value = previousIndex;
  };

  // Closes the Player
  const closePlayer = async () => {
    try {
      // Pause Spotify Before Clearing the Queue
      if (isPlaying.value) {
        await pauseSpotifyPlayback();
      }

      // Reset Shared Player State
      queue.value = [];
      currentIndex.value = 0;
      playerSource.value = null;
    } catch (error) {
      console.error("Failed to close Spotify player:", error);
      throw error;
    }
  };

  return {
    // State
    queue,
    currentTrack,
    currentTrackKey,
    currentIndex,
    playerSource,
    isPlaying,
    hasMultipleTracks,

    // Actions
    playTrack,
    playTracks,
    togglePlay,
    nextTrack,
    previousTrack,
    closePlayer,
  };
}