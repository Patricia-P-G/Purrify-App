import type { Track } from "@/types/music";
import type { SavedFavorite } from "@/services/appwrite/favorites";

// Checks Whether a Saved Track Has Complete Display Data
export const hasCompleteTrackData = (track: Track): boolean =>
  Boolean(
    track.id &&
      track.title &&
      track.artist &&
      track.image &&
      track.album &&
      track.duration > 0 &&
      track.uri,
  );

// Restores Track Objects Saved in Appwrite. Tracks with missing or invalid data are listed in missingIds.
export const restoreSavedTracks = (favorites: SavedFavorite[]) => {
  const restored = new Map<string, Track>();
  const missingIds: string[] = [];

  for (const favorite of favorites) {
    const track = parseSavedTrack(favorite);

    if (track) {
      restored.set(track.id, track);
    } else {
      missingIds.push(favorite.trackId);
    }
  }

  return { restored, missingIds };
};

const parseSavedTrack = (favorite: SavedFavorite): Track | null => {
  if (!favorite.trackData) return null;

  try {
    const track = JSON.parse(favorite.trackData) as Track;

    return track.id === favorite.trackId && hasCompleteTrackData(track) ? track : null;
  } catch (error) {
    console.error("Invalid favorite track data:", error);
    return null;
  }
};

// Keeps the Order of the Saved Favorites
export const orderTracks = (
  favorites: SavedFavorite[],
  tracks: Map<string, Track>,
): Track[] =>
  favorites
    .map((favorite) => tracks.get(favorite.trackId))
    .filter((track): track is Track => Boolean(track));
