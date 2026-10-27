import { spotifyFetch } from "@/services/spotify/api/spotifyClient";
import { mapSpotifyTrack, type SpotifyTrack } from "@/services/spotify/spotifyTrackMapper";
import type { Track } from "@/types/music";

export interface MadeForYouPlaylist {
  id: string;
  title: string;
  image: string;
  query: string;
}

// Defines the Spotify playlist data used by Purrify
interface SpotifyPlaylist {
  id: string;
  images: {
    url: string;
    width: number | null;
    height: number | null;
  }[];
}

// Defines the moods used to create the Made for You playlists
const moods = [
  {
    title: "Lo-fi Chill",
    query: "lofi chill",
  },
  {
    title: "Happy Chill",
    query: "happy chill",
  },
  {
    title: "Cozy Acoustic",
    query: "cozy acoustic",
  },
  {
    title: "Night Chill",
    query: "night chill",
  },
];

// Gets the most suitable playlist image for the card size
const getPlaylistImage = (
  images: SpotifyPlaylist["images"],
  targetWidth = 300,
) => {
  const validImages = images.filter((image) => image.url);

  if (!validImages.length) return "";

  return validImages.reduce((closest, image) => {
    if (!image.width) return closest;
    if (!closest.width) return image;

    return Math.abs(image.width - targetWidth) <
      Math.abs(closest.width - targetWidth)
      ? image
      : closest;
  }).url;
};

// Gets Spotify playlists for each mood
export async function getMadeForYouPlaylists(): Promise<MadeForYouPlaylist[]> {
  const cached = sessionStorage.getItem("made_for_you_playlists");

  // Uses the cache only when all 4 playlists were successfully saved
  if (cached) {
    try {
      const cachedPlaylists: MadeForYouPlaylist[] = JSON.parse(cached);

      if (cachedPlaylists.length === moods.length) {
        return cachedPlaylists;
      }

      // Removes an incomplete cache
      sessionStorage.removeItem("made_for_you_playlists");
    } catch {
      // Removes invalid cached data
      sessionStorage.removeItem("made_for_you_playlists");
    }
  }

  const results: MadeForYouPlaylist[] = [];

  // Loads each mood separately instead of sending all requests at once
  for (const mood of moods) {
    try {
      const data = await spotifyFetch(
        `/search?q=${encodeURIComponent(mood.query)}&type=playlist&limit=10`,
      );

      const items: (SpotifyPlaylist | null)[] = data.playlists?.items ?? [];

      const playlist = items.find(
        (item): item is SpotifyPlaylist =>
          item !== null &&
          Boolean(item.id) &&
          Array.isArray(item.images) &&
          item.images.length > 0,
      );

      if (!playlist) continue;

      results.push({
        id: playlist.id,
        title: mood.title,
        image: getPlaylistImage(playlist.images),
        query: mood.query,
      });
    } catch (error) {
      console.error(`Failed to load playlist for ${mood.query}:`, error);
    }
  }

  // Saves the cache only when all 4 playlists loaded successfully
  if (results.length === moods.length) {
    sessionStorage.setItem("made_for_you_playlists", JSON.stringify(results));
  }

  return results;
}

// Gets Spotify tracks that match the selected mood
export async function getMoodTracks(query: string): Promise<Track[]> {
  try {
    const data = await spotifyFetch(`/search?q=${encodeURIComponent(query)}&type=track&limit=5`);

    const items: SpotifyTrack[] = data.tracks?.items ?? [];

    return items
      .filter((track) => track.id && track.uri && track.name)
      .map((track) => mapSpotifyTrack(track));
  } catch (error) {
    console.error(`Failed to load tracks for ${query}:`, error);
    return [];
  }
}