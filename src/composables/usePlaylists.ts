import { ref } from "vue";
import type { Track } from "@/types/music";
import { getPlaylists, addPlaylist, updateAppwritePlaylist, removeAppwritePlaylist, addAppwritePlaylistTrack, removeAppwritePlaylistTrack } from "@/services/appwrite/playlists";
import { account } from "@/services/appwrite/appwrite";

// Playlist Type
export interface Playlist {
  id: string;
  name: string;
  description: string;
  cover: string | null;
  tracks: Track[];
  createdAt: string;
}

// Shared Playlist State
const playlists = ref<Playlist[]>([]);
const isLoading = ref(false);

let initializedUserId: string | null = null;
let loadingPromise: Promise<void> | null = null;

const pendingPlaylists = new Set<string>();

export function usePlaylists() {
  // Load Playlists From Appwrite
  const loadPlaylists = async (): Promise<void> => {
    if (loadingPromise) {
      return loadingPromise;
    }

    const user = await account.get();

    if (initializedUserId === user.$id) {
      return;
    }

    // Clear Previous User's Playlists
    if (initializedUserId !== user.$id) {
      playlists.value = [];
    }

    loadingPromise = (async () => {
      isLoading.value = true;

      try {
        const savedPlaylists = await getPlaylists();

        playlists.value = savedPlaylists;
        initializedUserId = user.$id;
      } catch (error) {
        initializedUserId = null;

        console.error("Failed to load playlists:", error);

        throw error;
      } finally {
        isLoading.value = false;
        loadingPromise = null;
      }
    })();

    return loadingPromise;
  };

  // Create Playlist
  const createPlaylist = async (
    name: string,
    description: string = "",
    cover: string | null = null,
    track: Track | null = null,
  ): Promise<Playlist | null> => {
    const cleanName = name.trim();

    if (!cleanName) {
      return null;
    }

    await loadPlaylists();

    const { id, createdAt } = await addPlaylist(cleanName, description.trim(), cover);

    const newPlaylist: Playlist = {
      id,
      name: cleanName,
      description: description.trim(),
      cover,
      tracks: [],
      createdAt,
    };

    playlists.value.push(newPlaylist);

    // Add Initial Track If Provided
    if (track) {
      try {
        await addAppwritePlaylistTrack(id, track, 0);

        newPlaylist.tracks.push(track);
      } catch (error) {
        console.error("Failed to add initial playlist track:", error);

        // Roll Back Playlist Creation
        try {
          await removeAppwritePlaylist(id);

          playlists.value = playlists.value.filter((playlist) => playlist.id !== id);
        } catch (rollbackError) {
          console.error("Failed to roll back playlist creation:", rollbackError);

          initializedUserId = null;
        }

        throw error;
      }
    }

    return newPlaylist;
  };

  // Update Playlist
  const updatePlaylist = async (
    playlistId: string,
    name: string,
    description: string,
    cover: string | null,
  ): Promise<boolean> => {
    await loadPlaylists();

    if (pendingPlaylists.has(playlistId)) {
      return false;
    }

    const playlist = playlists.value.find((playlist) => playlist.id === playlistId);

    const cleanName = name.trim();

    if (!playlist || !cleanName) {
      return false;
    }

    pendingPlaylists.add(playlistId);

    const previous = {
      name: playlist.name,
      description: playlist.description,
      cover: playlist.cover,
    };

    // Update UI Immediately
    playlist.name = cleanName;
    playlist.description = description.trim();
    playlist.cover = cover;

    try {
      await updateAppwritePlaylist(playlistId, cleanName, description.trim(), cover);

      return true;
    } catch (error) {
      // Roll Back If Saving Fails
      playlist.name = previous.name;
      playlist.description = previous.description;
      playlist.cover = previous.cover;

      console.error("Failed to update playlist:", error);

      throw error;
    } finally {
      pendingPlaylists.delete(playlistId);
    }
  };

  // Add Track To Playlist
  const addTrackToPlaylist = async (playlistId: string, track: Track): Promise<boolean> => {
    await loadPlaylists();

    if (pendingPlaylists.has(playlistId)) {
      return false;
    }

    const playlist = playlists.value.find((playlist) => playlist.id === playlistId);

    if (!playlist) {
      return false;
    }

    pendingPlaylists.add(playlistId);

    const position = playlist.tracks.length;

    // Update UI Immediately
    playlist.tracks.push(track);

    try {
      await addAppwritePlaylistTrack(playlistId, track, position);

      return true;
    } catch (error) {
      // Roll Back If Saving Fails
      playlist.tracks.splice(position, 1);

      console.error("Failed to add track to playlist:", error);

      throw error;
    } finally {
      pendingPlaylists.delete(playlistId);
    }
  };

  // Get Playlist By ID
  const getPlaylistById = (playlistId: string): Playlist | undefined => {
    return playlists.value.find((playlist) => playlist.id === playlistId);
  };

  // Delete Playlist
  const deletePlaylist = async (playlistId: string): Promise<boolean> => {
    await loadPlaylists();

    if (pendingPlaylists.has(playlistId)) {
      return false;
    }

    const index = playlists.value.findIndex((playlist) => playlist.id === playlistId);

    if (index === -1) {
      return false;
    }

    pendingPlaylists.add(playlistId);

    const previousPlaylist = playlists.value[index];

    if (!previousPlaylist) {
      return false;
    }

    // Update UI Immediately
    playlists.value.splice(index, 1);

    try {
      await removeAppwritePlaylist(playlistId);

      return true;
    } catch (error) {
      // Reload To Handle Partial Deletions
      initializedUserId = null;

      try {
        await loadPlaylists();
      } catch (reloadError) {
        console.error("Failed to reload playlists:", reloadError);

        playlists.value.splice(index, 0, previousPlaylist);
      }

      console.error("Failed to delete playlist:", error);

      throw error;
    } finally {
      pendingPlaylists.delete(playlistId);
    }
  };

  // Remove Track From Playlist
  const removeTrackFromPlaylist = async (playlistId: string, trackId: string): Promise<boolean> => {
    await loadPlaylists();

    if (pendingPlaylists.has(playlistId)) {
      return false;
    }

    const playlist = playlists.value.find((playlist) => playlist.id === playlistId);

    if (!playlist) {
      return false;
    }

    const trackIndex = playlist.tracks.findIndex((track) => track.id === trackId);

    if (trackIndex === -1) {
      return false;
    }

    pendingPlaylists.add(playlistId);

    const removedTrack = playlist.tracks[trackIndex];

    if (!removedTrack) {
      return false;
    }

    // Update UI Immediately
    playlist.tracks.splice(trackIndex, 1);

    try {
      await removeAppwritePlaylistTrack(playlistId, trackId);

      return true;
    } catch (error) {
      // Roll Back If Deleting Fails
      playlist.tracks.splice(trackIndex, 0, removedTrack);

      console.error("Failed to remove track from playlist:", error);

      throw error;
    } finally {
      pendingPlaylists.delete(playlistId);
    }
  };

  // Reset Playlists Without Deleting Appwrite Data
  const resetPlaylists = () => {
    playlists.value = [];
    initializedUserId = null;
    pendingPlaylists.clear();
  };

  // Automatically Restore Playlists
  if (localStorage.getItem("access_token")) {
    void loadPlaylists().catch((error) => {
      console.error("Failed to restore playlists from Appwrite:", error);
    });
  }

  return {
    playlists,
    isLoading,
    loadPlaylists,
    createPlaylist,
    updatePlaylist,
    addTrackToPlaylist,
    getPlaylistById,
    deletePlaylist,
    removeTrackFromPlaylist,
    resetPlaylists,
  };
}