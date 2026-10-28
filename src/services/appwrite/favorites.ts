import { ID, Query } from "appwrite";
import type { Models } from "appwrite";
import type { Track } from "@/types/music";
import { tablesDB } from "./client";
import { DATABASE_ID, getCurrentUserId, getUserPermissions, getAllRows } from "./utils";

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

// Update Existing Favorite
export const updateFavorite = async (track: Track) => {
  const userId = await getCurrentUserId();

  const response = await tablesDB.listRows<FavoriteRow>({
    databaseId: DATABASE_ID,
    tableId: TABLE_ID,
    queries: [
      Query.equal("userId", userId),
      Query.equal("trackId", track.id),
      Query.limit(1),
    ],
  });

  const favorite = response.rows[0];

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
  const userId = await getCurrentUserId();

  const response = await tablesDB.listRows<FavoriteRow>({
    databaseId: DATABASE_ID,
    tableId: TABLE_ID,
    queries: [
      Query.equal("userId", userId),
      Query.equal("trackId", trackId),
      Query.limit(1),
    ],
  });

  const favorite = response.rows[0];

  if (!favorite) {
    throw new Error(`Favorite not found: ${trackId}`);
  }

  // Delete Correct Song From Appwrite
  await tablesDB.deleteRow({
    databaseId: DATABASE_ID,
    tableId: TABLE_ID,
    rowId: favorite.$id,
  });
};