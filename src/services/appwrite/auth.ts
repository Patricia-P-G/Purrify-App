import { account, client } from "./client";
import { Functions } from "appwrite";
import { getCurrentUser, hasSessionHint, isUnauthorized, setSessionHint } from "./session";

const functions = new Functions(client);

// Connect Spotify User to Appwrite
export const loginWithAppwrite = async (accessToken: string) => {
  const response = await functions.createExecution({
    functionId: "spotify-auth",
    body: JSON.stringify({ accessToken }),
    async: false,
  });

  if (response.responseStatusCode !== 200) {
    throw new Error(
      `Appwrite authentication failed: ${response.responseBody}`
    );
  }

  const { userId, secret } = JSON.parse(response.responseBody);

  if (!userId || !secret) {
    throw new Error("Invalid Appwrite authentication response");
  }

  // Check Existing Appwrite Session (only if this browser has one, to avoid a 401 in the console)
  if (hasSessionHint()) {
    try {
      const currentUser = await getCurrentUser();

      // Reuse the Session If It Belongs to the Same User
      if (currentUser.$id === userId) {
        return currentUser;
      }

      // Remove the Previous Session If It Belongs to Another User
      await account.deleteSession({
        sessionId: "current",
      });
    } catch (error) {
      // Continue Only If No Active Session Exists
      if (!isUnauthorized(error)) {
        throw error;
      }
    }
  }

  // Create Appwrite Session
  try {
    await account.createSession({ userId, secret });
  } catch (error) {
    // A session can still exist if the hint was cleared: remove it and try once more
    if (!isUnauthorized(error)) throw error;

    await account.deleteSession({ sessionId: "current" });
    await account.createSession({ userId, secret });
  }

  setSessionHint();

  // Get Authenticated User
  return account.get();
};