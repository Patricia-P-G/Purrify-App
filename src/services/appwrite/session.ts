import { AppwriteException, type Models } from "appwrite";
import { account } from "./client";
 
// Remembers in this browser that an Appwrite session was created.
// Lets the app skip account.get() when nobody is logged in, so no 401 error shows in the console.
const SESSION_HINT_KEY = "purrify_has_session";
 
export const hasSessionHint = (): boolean => {
  try {
    return localStorage.getItem(SESSION_HINT_KEY) === "true";
  } catch {
    return false;
  }
};
 
export const setSessionHint = (): void => {
  try {
    localStorage.setItem(SESSION_HINT_KEY, "true");
  } catch {
    // Storage unavailable: the app still works, it just checks Appwrite directly
  }
};
 
export const clearSessionHint = (): void => {
  try {
    localStorage.removeItem(SESSION_HINT_KEY);
  } catch {
    // Nothing to clear
  }
};
 
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
  } finally {
    clearSessionHint();
  }
};