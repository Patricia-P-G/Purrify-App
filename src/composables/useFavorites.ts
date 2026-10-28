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
let loadingUserId: string | null = null;
let loadingPromise: Promise<void> | null = null;
let requestVersion = 0;

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

// Clear Local Favorites
const clearFavoritesState = () => {
  favoriteTracks.value = [];
  favoriteIds.value = [];
  initializedUserId = null;
};

// Reset Favorites Without Deleting Appwrite Data
const resetFavorites = () => {
  requestVersion++;

  clearFavoritesState();

  loadingPromise = null;
  loadingUserId = null;
  isLoading.value = false;
  pendingTracks.clear();
};

export function useFavorites() {

  // Load Favorites From Appwrite
  const loadFavorites = async (): Promise<void> => {
    let user;

    try {
      user = await account.get();
    } catch (error) {
      resetFavorites();
      throw error;
    }

    const userId = user.$id;

    // Reuse Loading Request For Same User
    if (loadingPromise && loadingUserId === userId) {
      return loadingPromise;
    }

    // Ignore Previously Loaded Favorites From Another User
    if (
      initializedUserId !== userId ||
      (loadingUserId !== null && loadingUserId !== userId)
    ) {
      requestVersion++;
      clearFavoritesState();
      pendingTracks.clear();
    }

    // Avoid Reloading Already Initialized Favorites
    if (initializedUserId === userId && !loadingPromise) {
      return;
    }

    const currentVersion = requestVersion;

    const isCurrentRequest = () =>
      currentVersion === requestVersion;

    loadingUserId = userId;
    isLoading.value = true;

    const promise = (async () => {
      try {
        // Load Saved Favorites From Appwrite
        const favorites = await getFavorites();

        if (!isCurrentRequest()) return;

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

        initializedUserId = userId;

        // Recover Missing Song Details From Spotify
        if (missingIds.length > 0) {
          try {
            const tracks = await getTracksByIds(missingIds);

            if (!isCurrentRequest()) return;

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

            if (!isCurrentRequest()) return;

            results.forEach((result) => {
              if (result.status === "rejected") {
                console.error(
                  "Failed to save recovered favorite:",
                  result.reason
                );
              }
            });
          } catch (error) {
            if (!isCurrentRequest()) return;

            console.error(
              "Failed to recover older favorites from Spotify:",
              error
            );
          }
        }
      } catch (error) {
        if (!isCurrentRequest()) return;

        clearFavoritesState();

        console.error("Failed to load favorites:", error);
        throw error;
      }
    })();

    loadingPromise = promise;

    try {
      await promise;
    } finally {
      if (isCurrentRequest()) {
        isLoading.value = false;
        loadingPromise = null;
        loadingUserId = null;
      }
    }
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

      const currentVersion = requestVersion;

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
        if (currentVersion === requestVersion) {
          favoriteIds.value = favoriteIds.value.filter(
            (id) => id !== track.id
          );

          favoriteTracks.value = favoriteTracks.value.filter(
            (item) => item.id !== track.id
          );
        }

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

      const currentVersion = requestVersion;

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
        if (currentVersion === requestVersion) {
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