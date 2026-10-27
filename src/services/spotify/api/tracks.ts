import { spotifyFetch } from "./spotifyClient";
import { mapSpotifyTrack } from "../spotifyTrackMapper";
import type { SpotifyTrack } from "../spotifyTrackMapper";
import type { Track } from "@/types/music";

// Get Spotify Tracks By IDs
export const getTracksByIds = async (trackIds: string[]): Promise<Track[]> => {
  if (!trackIds.length) return [];

  const tracks: Track[] = [];

  // Spotify allows up to 50 tracks per request
  for (let i = 0; i < trackIds.length; i += 50) {
    const ids = trackIds.slice(i, i + 50);

    const data = await spotifyFetch(
      `/tracks?ids=${ids.join(",")}`
    );

    const fetchedTracks = (data.tracks as (SpotifyTrack | null)[])
      .filter((track): track is SpotifyTrack => track !== null)
      .map(mapSpotifyTrack);

    tracks.push(...fetchedTracks);
  }

  return tracks;
};