import { ID, Permission, Role } from "appwrite";
import { storage } from "./client";
import { getCurrentUserId } from "./utils";

const COVERS_BUCKET_ID = import.meta.env.VITE_APPWRITE_COVERS_BUCKET_ID;

export const MAX_COVER_SIZE = 2 * 1024 * 1024;

// Playlist covers are saved in Appwrite Storage instead of the database.
// Anyone can view a cover image, only the owner can change or delete it.
export const uploadCover = async (file: File): Promise<string> => {
  const userId = await getCurrentUserId();

  const uploaded = await storage.createFile({
    bucketId: COVERS_BUCKET_ID,
    fileId: ID.unique(),
    file,
    permissions: [
      Permission.read(Role.any()),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
  });

  return storage.getFileView({
    bucketId: COVERS_BUCKET_ID,
    fileId: uploaded.$id,
  });
};

// Gets the file id from an Appwrite Storage URL (older covers are Data URLs and return null)
const getCoverFileId = (url: string): string | null => {
  const match = url.match(
    new RegExp(`/buckets/${COVERS_BUCKET_ID}/files/([^/]+)/view`),
  );

  return match?.[1] ?? null;
};

// Deletes a cover from Storage. Never throws: a leftover file is not worth failing an action.
export const deleteCover = async (url: string | null | undefined): Promise<void> => {
  if (!url) return;

  const fileId = getCoverFileId(url);

  if (!fileId) return;

  try {
    await storage.deleteFile({ bucketId: COVERS_BUCKET_ID, fileId });
  } catch (error) {
    console.error("Failed to delete playlist cover:", error);
  }
};
