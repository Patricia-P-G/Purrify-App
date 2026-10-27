import { spotifyFetch } from "@/services/spotify/api/spotifyClient";
import { mapSpotifyTrack, type SpotifyTrack } from "@/services/spotify/spotifyTrackMapper";
import type { Track } from "@/types/music";

export type MusicMood = "focus" | "chill" | "night";

//  Search terms used for each Hero mood. The Hero only needs to provide the mood
const moodQueries: Record<MusicMood, string> = {
  focus: "lofi hip hop instrumental study beats chillhop concentration no vocals",
  chill: "chill acoustic indie soft pop mellow relaxing cozy afternoon",
  night: "dream pop ambient indie r&b dreamy slow late night chill",
};

// Gets Spotify tracks based on the selected Hero mood
export async function getTracksForMood(mood: MusicMood): Promise<Track[]> {
  try {
    const query = moodQueries[mood];

    const data = await spotifyFetch(`/search?q=${encodeURIComponent(query)}&type=track&limit=10`);

    const tracks: SpotifyTrack[] = data.tracks?.items ?? [];


    // Converts Spotify tracks into the Track structure used by Purrify
    return tracks
      .filter((track) => track.id && track.uri && track.name)
      .map((track) => mapSpotifyTrack(track));
  } catch (error) {
    console.error(`Failed to get tracks for ${mood} mood:`, error);

    return [];
  }
}