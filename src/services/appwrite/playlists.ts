import { ID, Query } from "appwrite";
import type { Models } from "appwrite";
import type { Track } from "@/types/music";
import { tablesDB } from "./client";
import { DATABASE_ID, getCurrentUserId, getUserPermissions, getAllRows } from "./utils";

const PLAYLISTS_TABLE_ID = import.meta.env.VITE_APPWRITE_PLAYLISTS_TABLE_ID;
const TRACKS_TABLE_ID = import.meta.env.VITE_APPWRITE_PLAYLIST_TRACKS_TABLE_ID;

// Playlist Types
export interface SavedPlaylist {
  id: string;
  name: string;
  description: string;
  cover: string | null;
  tracks: Track[];
  createdAt: string;
}

interface PlaylistRow extends Models.Row {
  userId: string;
  name: string;
  description: string;
  cover: string | null;
}

interface PlaylistTrackRow extends Models.Row {
  userId: string;
  playlistId: string;
  trackId: string;
  trackData: string;
  position: number;
}

// Verify That Playlist Belongs To Current User
const verifyPlaylistOwnership = async (
  playlistId: string,
  userId: string
): Promise<void> => {
  const playlist = await tablesDB.getRow<PlaylistRow>({
    databaseId: DATABASE_ID,
    tableId: PLAYLISTS_TABLE_ID,
    rowId: playlistId,
  });

  if (playlist.userId !== userId) {
    throw new Error(
      "You do not have permission to modify this playlist."
    );
  }
};

// Load Playlists And Their Tracks
export const getPlaylists = async (): Promise<SavedPlaylist[]> => {
  const userId = await getCurrentUserId();

  const playlistRows = await getAllRows<PlaylistRow>(
    PLAYLISTS_TABLE_ID,
    [
      Query.equal("userId", userId),
      Query.orderDesc("$createdAt"),
    ]
  );

  if (!playlistRows.length) return [];

  const trackRows = await getAllRows<PlaylistTrackRow>(
    TRACKS_TABLE_ID,
    [
      Query.equal("userId", userId),
      Query.orderAsc("position"),
    ]
  );

  // Group Tracks By Playlist
  const tracksByPlaylist = new Map<string, Track[]>();
  const ownedPlaylistIds = new Set(
    playlistRows.map((playlist) => playlist.$id)
  );

  for (const row of trackRows) {
    // Ignore Tracks Without An Owned Playlist
    if (!ownedPlaylistIds.has(row.playlistId)) {
      continue;
    }

    try {
      const track = JSON.parse(row.trackData) as Track;

      if (track.id !== row.trackId) continue;

      const tracks = tracksByPlaylist.get(row.playlistId) ?? [];
      tracks.push(track);
      tracksByPlaylist.set(row.playlistId, tracks);
    } catch (error) {
      console.error("Invalid playlist track data:", error);
    }
  }

  // Restore Playlists With Their Tracks
  return playlistRows.map((row) => ({
    id: row.$id,
    name: row.name,
    description: row.description,
    cover: row.cover ?? null,
    tracks: tracksByPlaylist.get(row.$id) ?? [],
    createdAt: row.$createdAt,
  }));
};

// Create Playlist
export const addPlaylist = async (
  name: string,
  description: string = "",
  cover: string | null = null,
  playlistId: string = ID.unique()
): Promise<{ id: string; createdAt: string }> => {
  const userId = await getCurrentUserId();

  const row = await tablesDB.createRow({
    databaseId: DATABASE_ID,
    tableId: PLAYLISTS_TABLE_ID,
    rowId: playlistId,
    data: {
      userId,
      name,
      description,
      cover,
    },
    permissions: getUserPermissions(userId),
  });

  return {
    id: row.$id,
    createdAt: row.$createdAt,
  };
};

// Update Playlist
export const updateAppwritePlaylist = async (
  playlistId: string,
  name: string,
  description: string,
  cover: string | null
): Promise<void> => {
  const userId = await getCurrentUserId();

  // Verify Playlist Ownership
  await verifyPlaylistOwnership(playlistId, userId);

  await tablesDB.updateRow({
    databaseId: DATABASE_ID,
    tableId: PLAYLISTS_TABLE_ID,
    rowId: playlistId,
    data: {
      name,
      description,
      cover,
    },
  });
};

// Delete Playlist
export const removeAppwritePlaylist = async (
  playlistId: string
): Promise<void> => {
  const userId = await getCurrentUserId();

  // Verify Playlist Ownership
  await verifyPlaylistOwnership(playlistId, userId);

  // Get Playlist Tracks
  const tracks = await getAllRows<PlaylistTrackRow>(
    TRACKS_TABLE_ID,
    [
      Query.equal("userId", userId),
      Query.equal("playlistId", playlistId),
    ]
  );

  // Delete Playlist Tracks
  const results = await Promise.allSettled(
    tracks.map((track) =>
      tablesDB.deleteRow({
        databaseId: DATABASE_ID,
        tableId: TRACKS_TABLE_ID,
        rowId: track.$id,
      })
    )
  );

  const failed = results.filter(
    (result) => result.status === "rejected"
  );

  if (failed.length) {
    console.error(
      "Failed to delete some playlist tracks:",
      failed
    );

    throw new Error(
      "Could not delete all playlist tracks."
    );
  }

  // Delete Playlist
  await tablesDB.deleteRow({
    databaseId: DATABASE_ID,
    tableId: PLAYLISTS_TABLE_ID,
    rowId: playlistId,
  });
};

// Add Track To Playlist
export const addAppwritePlaylistTrack = async (
  playlistId: string,
  track: Track,
  position: number
): Promise<void> => {
  const userId = await getCurrentUserId();

  // Verify Playlist Ownership
  await verifyPlaylistOwnership(playlistId, userId);

  await tablesDB.createRow({
    databaseId: DATABASE_ID,
    tableId: TRACKS_TABLE_ID,
    rowId: ID.unique(),
    data: {
      userId,
      playlistId,
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      trackData: JSON.stringify(track),
      position,
    },
    permissions: getUserPermissions(userId),
  });
};

// Remove Track From Playlist
export const removeAppwritePlaylistTrack = async (
  playlistId: string,
  trackId: string
): Promise<void> => {
  const userId = await getCurrentUserId();

  // Verify Playlist Ownership
  await verifyPlaylistOwnership(playlistId, userId);

  // Find Matching Track
  const response = await tablesDB.listRows<PlaylistTrackRow>({
    databaseId: DATABASE_ID,
    tableId: TRACKS_TABLE_ID,
    queries: [
      Query.equal("userId", userId),
      Query.equal("playlistId", playlistId),
      Query.equal("trackId", trackId),
      Query.orderAsc("position"),
      Query.limit(1),
    ],
  });

  const track = response.rows[0];

  if (!track) {
    throw new Error(
      `Playlist track not found: ${trackId}`
    );
  }

  // Delete Track
  await tablesDB.deleteRow({
    databaseId: DATABASE_ID,
    tableId: TRACKS_TABLE_ID,
    rowId: track.$id,
  });
};