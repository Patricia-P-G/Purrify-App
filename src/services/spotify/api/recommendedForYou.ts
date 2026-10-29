import { spotifyFetch } from "@/services/spotify/api/spotifyClient";
import { mapSpotifyTrack, type SpotifyTrack } from "@/services/spotify/spotifyTrackMapper";
import type { Track } from "@/types/music";

interface SpotifyArtist {
  id: string;
  name: string;
}

interface CachedRecommendations {
  songs: Track[];
  timestamp: number;
}

// Recommendation Settings
const CACHE_KEY = "recommended_songs";
const CACHE_DURATION = 3 * 60 * 60 * 1000;
const RECOMMENDATION_LIMIT = 4;
const ARTIST_LIMIT = 20;

// Removes cached recommendations, so the next user doesn't see them
export function clearRecommendationsCache() {
  localStorage.removeItem(CACHE_KEY);
}

// Generates personalized song recommendations based on the user's top artists
// Refreshes recommendations every 3 hours and avoids previously recommended songs
export async function getRecommendedSongs(): Promise<Track[]> {
  const cached = localStorage.getItem(CACHE_KEY);
  let previousSongs: Track[] = [];

  // Retrieves Cached Recommendations
  if (cached) {
    try {
      const saved: CachedRecommendations = JSON.parse(cached);

      if (Array.isArray(saved.songs)) {
        previousSongs = saved.songs;

        // Reuses Valid Recommendations Until the Cache Expires
        if (
          saved.songs.length === RECOMMENDATION_LIMIT &&
          saved.songs.every((track) => Array.isArray(track.artists) && track.artists.length > 0) &&
          typeof saved.timestamp === "number" &&
          Date.now() - saved.timestamp < CACHE_DURATION
        ) {
          return saved.songs;
        }
      }
    } catch {
      localStorage.removeItem(CACHE_KEY);
    }
  }

  try {
    // Fetches the User's Top Spotify Artists
    const topArtists = await spotifyFetch(
      `/me/top/artists?limit=${ARTIST_LIMIT}&time_range=medium_term`,
    );

    const artists: SpotifyArtist[] = topArtists.items ?? [];

    if (!artists.length) return [];

    const recommendations: Track[] = [];
    const fallbackTracks: Track[] = [];

    // Searches for Songs by the User's Favorite Artists
    for (const artist of artists) {
      if (recommendations.length >= RECOMMENDATION_LIMIT) break;

      try {
        const data = await spotifyFetch(
          `/search?q=${encodeURIComponent(artist.name)}&type=track&limit=10`,
        );

        const tracks: SpotifyTrack[] = data.tracks?.items ?? [];

        // Keeps Valid Songs Featuring the Selected Artist
        const matchingTracks = tracks.filter(
          (track) =>
            track.id &&
            track.uri &&
            track.name &&
            track.artists.some((trackArtist) => trackArtist.id === artist.id),
        );

        // Randomizes Songs to Add Variety
        const shuffledTracks = [...matchingTracks].sort(() => Math.random() - 0.5);

        // Prioritizes Songs Not Included in Previous Recommendations
        for (const track of shuffledTracks) {
          const alreadySelected = recommendations.some((song) => song.id === track.id);

          if (alreadySelected) continue;

          const mappedTrack = mapSpotifyTrack(track);

          const previouslyRecommended = previousSongs.some((song) => song.id === track.id);

          if (previouslyRecommended) {
            fallbackTracks.push(mappedTrack);
            continue;
          }

          recommendations.push(mappedTrack);
          break;
        }
      } catch (error) {
        console.error(`Failed to find recommendation for ${artist.name}:`, error);
      }
    }

    // Uses Previous Songs Only When New Songs Are Insufficient
    for (const track of fallbackTracks) {
      if (recommendations.length >= RECOMMENDATION_LIMIT) break;

      if (!recommendations.some((song) => song.id === track.id)) {
        recommendations.push(track);
      }
    }

    // Keeps a Maximum of 4 Unique Songs
    const uniqueRecommendations = recommendations
      .filter((track, index, array) => array.findIndex((item) => item.id === track.id) === index)
      .slice(0, RECOMMENDATION_LIMIT);

    // Saves Recommendations with Their Refresh Time
    if (uniqueRecommendations.length) {
      const cacheData: CachedRecommendations = {
        songs: uniqueRecommendations,
        timestamp: Date.now(),
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    }

    return uniqueRecommendations;
  } catch (error) {
    console.error("Failed to get recommended songs:", error);
    return previousSongs;
  }
}