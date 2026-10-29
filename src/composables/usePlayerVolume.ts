import { ref } from "vue";
import { setSpotifyVolume } from "@/services/spotify/spotifyPlayer";

// Volume and mute logic for the music player
export function usePlayerVolume() {
  const volume = ref(50);
  const previousVolume = ref(50);

  const applyVolume = async (value: number) => {
    try {
      await setSpotifyVolume(value / 100);
    } catch (error) {
      console.error("Failed to change Spotify volume:", error);
    }
  };

  // Sends the slider value to Spotify
  const changeVolume = () => {
    if (volume.value > 0) previousVolume.value = volume.value;
    return applyVolume(volume.value);
  };

  // Mutes, or restores the volume from before muting
  const toggleMute = () => {
    if (volume.value > 0) {
      previousVolume.value = volume.value;
      volume.value = 0;
    } else {
      volume.value = previousVolume.value;
    }

    return applyVolume(volume.value);
  };

  return { volume, changeVolume, toggleMute };
}