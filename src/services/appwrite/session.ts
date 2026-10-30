import { AppwriteException, type Models } from "appwrite";
import { account } from "./client";

export const isUnauthorized = (error: unknown): boolean =>
  error instanceof AppwriteException && error.code === 401;

// Returns the signed-in user. Throws an AppwriteException (401) if there is no session.
export const getCurrentUser = (): Promise<Models.User<Models.Preferences>> => account.get();

// Ends the Appwrite session. A missing or expired session counts as logged out.
export const endSession = async (): Promise<void> => {
  try {
    await account.deleteSession({ sessionId: "current" });
  } catch (error) {
    if (!isUnauthorized(error)) throw error;
  }
};