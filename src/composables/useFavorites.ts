import { ref } from "vue";
import type { Track } from "@/types/music";
import {
  getFavorites,
  addFavorite as addAppwriteFavorite,
  updateFavorite as updateAppwriteFavorite,
  removeFavorite as removeAppwriteFavorite,
} from "@/services/appwrite/favorites";
import { getTracksByIds } from "@/services/spotify/api/tracks";
import { account } from "@/services/appwrite/appwrite";

const favoriteTracks = ref<Track[]>([]);
const favoriteIds = ref<string[]>([]);
const isLoading = ref(false);

let initializedUserId: string | null = null;
let loadingPromise: Promise<void> | null = null;

const pendingTracks = new Set<string>();

// --------------------------------------------------- Favorites ---------------------------------------------------

// Check Whether Saved Track Has Complete Display Data
const hasCompleteTrackData = (track: Track): boolean => {
  return Boolean(
    track.id &&
    track.title &&
    track.artist &&
    track.image &&
    track.album &&
    track.duration > 0 &&
    track.uri
  );
};

export function useFavorites() {

  // Load Favorites From Appwrite
  const loadFavorites = async (): Promise<void> => {
    if (loadingPromise) return loadingPromise;

    const user = await account.get();

    if (initializedUserId === user.$id) return;

    loadingPromise = (async () => {
      isLoading.value = true;

      try {
        // Load Saved Favorites From Appwrite
        const favorites = await getFavorites();

        const restoredTracks = new Map<string, Track>();
        const missingIds: string[] = [];

        // Restore Original Track Objects
        for (const favorite of favorites) {
          if (favorite.trackData) {
            try {
              const track = JSON.parse(
                favorite.trackData
              ) as Track;

              if (
                track.id === favorite.trackId &&
                hasCompleteTrackData(track)
              ) {
                restoredTracks.set(track.id, track);
                continue;
              }
            } catch (error) {
              console.error(
                "Invalid favorite track data:",
                error
              );
            }
          }

          missingIds.push(favorite.trackId);
        }

        // Restore Favorite IDs And Complete Songs
        favoriteIds.value = favorites.map(
          (favorite) => favorite.trackId
        );

        favoriteTracks.value = favorites
          .map((favorite) =>
            restoredTracks.get(favorite.trackId)
          )
          .filter((track): track is Track => Boolean(track));

        initializedUserId = user.$id;

        // Recover Missing Song Details From Spotify
        if (missingIds.length > 0) {
          try {
            const tracks = await getTracksByIds(missingIds);

            for (const track of tracks) {
              if (!favoriteIds.value.includes(track.id)) continue;

              restoredTracks.set(track.id, track);
            }

            // Preserve Favorites Order
            favoriteTracks.value = favorites
              .map((favorite) =>
                restoredTracks.get(favorite.trackId)
              )
              .filter((track): track is Track => Boolean(track));

            // Save Recovered Tracks For Future Refreshes
            const results = await Promise.allSettled(
              tracks.map((track) =>
                updateAppwriteFavorite(track)
              )
            );

            results.forEach((result) => {
              if (result.status === "rejected") {
                console.error(
                  "Failed to save recovered favorite:",
                  result.reason
                );
              }
            });
          } catch (error) {
            console.error(
              "Failed to recover older favorites from Spotify:",
              error
            );
          }
        }
      } catch (error) {
        initializedUserId = null;
        console.error("Failed to load favorites:", error);
        throw error;
      } finally {
        isLoading.value = false;
        loadingPromise = null;
      }
    })();

    return loadingPromise;
  };

  // Check If Track Is Favorite
  const isFavorite = (trackId: string): boolean => {
    return favoriteIds.value.includes(trackId);
  };

  // Add Favorite
  const addFavorite = async (track: Track) => {
    if (pendingTracks.has(track.id)) return;

    pendingTracks.add(track.id);

    try {
      // Ensure Favorites Are Loaded
      await loadFavorites();

      if (isFavorite(track.id)) return;

      // Update UI Immediately
      favoriteIds.value = [
        ...favoriteIds.value,
        track.id,
      ];

      favoriteTracks.value = [
        ...favoriteTracks.value.filter(
          (item) => item.id !== track.id
        ),
        track,
      ];

      try {
        // Save Complete Track To Appwrite
        await addAppwriteFavorite(track);
      } catch (error) {
        // Roll Back If Saving Fails
        favoriteIds.value = favoriteIds.value.filter(
          (id) => id !== track.id
        );

        favoriteTracks.value = favoriteTracks.value.filter(
          (item) => item.id !== track.id
        );

        console.error("Failed to save favorite:", error);
        throw error;
      }
    } finally {
      pendingTracks.delete(track.id);
    }
  };

  // Remove Favorite
  const removeFavorite = async (trackId: string) => {
    if (pendingTracks.has(trackId)) return;

    pendingTracks.add(trackId);

    try {
      await loadFavorites();

      if (!isFavorite(trackId)) return;

      const previousTrack = favoriteTracks.value.find(
        (track) => track.id === trackId
      );

      const previousIndex = favoriteTracks.value.findIndex(
        (track) => track.id === trackId
      );

      // Update UI Immediately
      favoriteIds.value = favoriteIds.value.filter(
        (id) => id !== trackId
      );

      favoriteTracks.value = favoriteTracks.value.filter(
        (track) => track.id !== trackId
      );

      try {
        // Remove Favorite From Appwrite
        await removeAppwriteFavorite(trackId);
      } catch (error) {
        // Roll Back If Deleting Fails
        favoriteIds.value = [
          ...favoriteIds.value,
          trackId,
        ];

        if (previousTrack) {
          const restored = [...favoriteTracks.value];

          restored.splice(
            Math.max(previousIndex, 0),
            0,
            previousTrack
          );

          favoriteTracks.value = restored;
        }

        console.error("Failed to remove favorite:", error);
        throw error;
      }
    } finally {
      pendingTracks.delete(trackId);
    }
  };

  // Toggle Favorite
  const toggleFavorite = async (
    track: Track
  ): Promise<boolean> => {
    await loadFavorites();

    if (pendingTracks.has(track.id)) {
      return isFavorite(track.id);
    }

    if (isFavorite(track.id)) {
      await removeFavorite(track.id);
      return false;
    }

    await addFavorite(track);
    return true;
  };

  // Clear Local State Without Deleting Appwrite Favorites
  const resetFavorites = () => {
    favoriteTracks.value = [];
    favoriteIds.value = [];
    initializedUserId = null;
  };

  // Automatically Restore Favorites
  if (localStorage.getItem("access_token")) {
    void loadFavorites().catch((error) => {
      console.error(
        "Failed to restore favorites from Appwrite:",
        error
      );
    });
  }

  return {
    favoriteTracks,
    favoriteIds,
    isLoading,
    isFavorite,
    loadFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    resetFavorites,
  };
}