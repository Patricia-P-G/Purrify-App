import { ID, Query, Permission, Role } from "appwrite";
import type { Track } from "@/types/music";
import { account, tablesDB } from "./appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = "favorites";

export interface SavedFavorite {
  trackId: string;
  title: string | null;
  artist: string | null;
  trackData: string | null;
}

// Get Current User
const getCurrentUserId = async (): Promise<string> => {
  const user = await account.get();
  return user.$id;
};

// Get Favorites From Appwrite
export const getFavorites = async (): Promise<SavedFavorite[]> => {
  const userId = await getCurrentUserId();

  const favorites: SavedFavorite[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [
        Query.equal("userId", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
        Query.offset(offset),
      ],
    });

    favorites.push(
      ...response.rows.map((row) => ({
        trackId: row.trackId as string,
        title: (row.title as string | null) ?? null,
        artist: (row.artist as string | null) ?? null,
        trackData: (row.trackData as string | null) ?? null,
      }))
    );

    if (response.rows.length < limit) break;
    offset += limit;
  }

  return favorites;
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
    permissions: [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
  });
};

// Update Existing Favorite
export const updateFavorite = async (track: Track) => {
  const userId = await getCurrentUserId();

  const response = await tablesDB.listRows({
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

  const response = await tablesDB.listRows({
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