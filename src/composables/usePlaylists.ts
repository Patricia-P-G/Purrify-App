import { ref } from "vue";
import type { Track } from "@/types/music";
import { getPlaylists, addPlaylist, updateAppwritePlaylist, removeAppwritePlaylist, addAppwritePlaylistTrack, removeAppwritePlaylistTrack } from "@/services/appwrite/playlists";
import { account } from "@/services/appwrite/client";

export interface Playlist {
  id: string;
  name: string;
  description: string;
  cover: string | null;
  tracks: Track[];
  createdAt: string;
}

// Shared State
const playlists = ref<Playlist[]>([]);
const isLoading = ref(false);
const pendingPlaylists = new Set<string>();
let userId: string | null = null;
let loaded = false;
let loadingPromise: Promise<void> | null = null;
let version = 0;

type Session = { userId: string; version: number };
const isCurrent = (session: Session) => session.version === version && session.userId === userId;

// Clear Local State Without Deleting Appwrite Data
const resetPlaylists = () => {
  version++;
  userId = null;
  loaded = false;
  loadingPromise = null;
  playlists.value = [];
  isLoading.value = false;
  pendingPlaylists.clear();
};

export function usePlaylists() {
  // Load Saved Playlists for the Signed-In User
  const loadPlaylists = async (): Promise<void> => {
    const startedAt = version;
    const user = await account.get();
    if (startedAt !== version) return;

    if (userId === null) {
      userId = user.$id;
    } else if (userId !== user.$id) {
      resetPlaylists();
      userId = user.$id;
    }
    if (loaded) return;
    if (loadingPromise) return loadingPromise;

    const session = { userId: user.$id, version };
    isLoading.value = true;

    const request = (async () => {
      try {
        const saved = await getPlaylists();
        if (!isCurrent(session)) return;
        playlists.value = saved;
        loaded = true;
      } catch (error) {
        if (isCurrent(session)) {
          console.error("Failed to load playlists:", error);
          throw error;
        }
      } finally {
        if (isCurrent(session)) {
          isLoading.value = false;
          loadingPromise = null;
        }
      }
    })();

    loadingPromise = request;
    return request;
  };

  // Verify the Session Before Changing Shared State
  const ready = async (startedAt: number): Promise<Session | null> => {
    await loadPlaylists();
    if (startedAt !== version || !userId || !loaded) return null;
    return { userId, version };
  };

  // Run One Mutation at a Time per Playlist
  const mutate = async (
    playlistId: string,
    action: (playlist: Playlist, session: Session) => Promise<boolean>,
  ): Promise<boolean> => {
    const session = await ready(version);
    if (!session || pendingPlaylists.has(playlistId)) return false;
    const playlist = playlists.value.find((item) => item.id === playlistId);
    if (!playlist) return false;

    pendingPlaylists.add(playlistId);
    try {
      return await action(playlist, session);
    } finally {
      if (isCurrent(session)) pendingPlaylists.delete(playlistId);
    }
  };

  // Create Playlist
  const createPlaylist = async (
    name: string,
    description = "",
    cover: string | null = null,
    track: Track | null = null,
  ): Promise<Playlist | null> => {
    const cleanName = name.trim();
    if (!cleanName) return null;
    const session = await ready(version);
    if (!session) return null;

    const { id, createdAt } = await addPlaylist(cleanName, description.trim(), cover);
    if (!isCurrent(session)) return null;

    const playlist: Playlist = {
      id,
      name: cleanName,
      description: description.trim(),
      cover,
      tracks: [],
      createdAt,
    };
    playlists.value.push(playlist);

    if (track) {
      try {
        await addAppwritePlaylistTrack(id, track, 0);
        if (!isCurrent(session)) return null;
        playlist.tracks.push(track);
      } catch (error) {
        console.error("Failed to add initial playlist track:", error);
        try {
          await removeAppwritePlaylist(id);
          if (isCurrent(session)) {
            playlists.value = playlists.value.filter((item) => item.id !== id);
          }
        } catch (rollbackError) {
          console.error("Failed to roll back playlist creation:", rollbackError);
          if (isCurrent(session)) loaded = false;
        }
        throw error;
      }
    }
    return playlist;
  };

  // Update Playlist
  const updatePlaylist = (
    playlistId: string,
    name: string,
    description: string,
    cover: string | null,
  ): Promise<boolean> =>
    mutate(playlistId, async (playlist, session) => {
      const cleanName = name.trim();
      if (!cleanName) return false;

      const previous = {
        name: playlist.name,
        description: playlist.description,
        cover: playlist.cover,
      };
      Object.assign(playlist, { name: cleanName, description: description.trim(), cover });
      try {
        await updateAppwritePlaylist(playlistId, cleanName, description.trim(), cover);
        return isCurrent(session);
      } catch (error) {
        if (isCurrent(session)) Object.assign(playlist, previous);
        console.error("Failed to update playlist:", error);
        throw error;
      }
    });

  // Add Track To Playlist
  const addTrackToPlaylist = (playlistId: string, track: Track): Promise<boolean> =>
    mutate(playlistId, async (playlist, session) => {
      const position = playlist.tracks.length;
      playlist.tracks.push(track);
      try {
        await addAppwritePlaylistTrack(playlistId, track, position);
        return isCurrent(session);
      } catch (error) {
        if (isCurrent(session)) playlist.tracks.splice(position, 1);
        console.error("Failed to add track to playlist:", error);
        throw error;
      }
    });

  const getPlaylistById = (playlistId: string): Playlist | undefined =>
    playlists.value.find((playlist) => playlist.id === playlistId);

  // Delete Playlist; Reload If the Server Reports an Error
  const deletePlaylist = (playlistId: string): Promise<boolean> =>
    mutate(playlistId, async (playlist, session) => {
      playlists.value = playlists.value.filter((item) => item.id !== playlistId);
      try {
        await removeAppwritePlaylist(playlistId);
        return isCurrent(session);
      } catch (error) {
        if (isCurrent(session)) {
          loaded = false;
          try {
            await loadPlaylists();
          } catch (reloadError) {
            console.error("Failed to reload playlists:", reloadError);
            if (isCurrent(session) && !playlists.value.some((p) => p.id === playlistId)) {
              playlists.value.push(playlist);
            }
          }
        }
        console.error("Failed to delete playlist:", error);
        throw error;
      }
    });
  // Remove Track From Playlist
  const removeTrackFromPlaylist = (playlistId: string, trackId: string): Promise<boolean> =>
    mutate(playlistId, async (playlist, session) => {
      const index = playlist.tracks.findIndex((track) => track.id === trackId);
      if (index < 0) return false;
      const removed = playlist.tracks[index];
      if (!removed) return false;

      playlist.tracks.splice(index, 1);
      try {
        await removeAppwritePlaylistTrack(playlistId, trackId);
        return isCurrent(session);
      } catch (error) {
        if (isCurrent(session)) playlist.tracks.splice(index, 0, removed);
        console.error("Failed to remove track from playlist:", error);
        throw error;
      }
    });

  return {
    playlists, isLoading, loadPlaylists, createPlaylist, updatePlaylist, addTrackToPlaylist,
    getPlaylistById, deletePlaylist, removeTrackFromPlaylist, resetPlaylists,
  };
}