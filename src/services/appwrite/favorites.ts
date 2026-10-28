import { ID, Query } from "appwrite";
import type { Models } from "appwrite";
import type { Track } from "@/types/music";
import { tablesDB } from "./client";
import { DATABASE_ID, findRow, getCurrentUserId, getUserPermissions, getAllRows } from "./utils";

const TABLE_ID = import.meta.env.VITE_APPWRITE_FAVORITES_TABLE_ID;

// Favorite Types
export interface SavedFavorite {
  trackId: string;
  title: string | null;
  artist: string | null;
  trackData: string | null;
}

interface FavoriteRow extends Models.Row {
  userId: string;
  trackId: string;
  title: string | null;
  artist: string | null;
  trackData: string | null;
}

// Get Favorites From Appwrite
export const getFavorites = async (): Promise<SavedFavorite[]> => {
  const userId = await getCurrentUserId();

  const rows = await getAllRows<FavoriteRow>(TABLE_ID, [
    Query.equal("userId", userId),
    Query.orderDesc("$createdAt"),
  ]);

  return rows.map((row) => ({
    trackId: row.trackId,
    title: row.title ?? null,
    artist: row.artist ?? null,
    trackData: row.trackData ?? null,
  }));
};

// Add Favorite
export const addFavorite = async (track: Track) => {
  const userId = await getCurrentUserId();

  return tablesDB.createRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_ID,
    rowId: ID.unique(),
    data: {
      userId,
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      trackData: JSON.stringify(track),
    },
    permissions: getUserPermissions(userId),
  });
};

// Finds the Current User's Favorite for a Track
const findFavorite = async (trackId: string) => {
  const userId = await getCurrentUserId();

  return findRow<FavoriteRow>(TABLE_ID, [
    Query.equal("userId", userId),
    Query.equal("trackId", trackId),
  ]);
};

// Update Existing Favorite
export const updateFavorite = async (track: Track) => {
  const favorite = await findFavorite(track.id);

  if (!favorite) return;

  return tablesDB.updateRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_ID,
    rowId: favorite.$id,
    data: {
      title: track.title,
      artist: track.artist,
      trackData: JSON.stringify(track),
    },
  });
};

// Remove Favorite
export const removeFavorite = async (trackId: string) => {
  const favorite = await findFavorite(trackId);

  if (!favorite) {
    throw new Error(`Favorite not found: ${trackId}`);
  }

  await tablesDB.deleteRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_ID,
    rowId: favorite.$id,
  });
};