import { account, client } from "./client";
import { AppwriteException, Functions } from "appwrite";

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

  // Check Existing Appwrite Session
  try {
    const currentUser = await account.get();

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
    if (
      !(error instanceof AppwriteException) ||
      error.code !== 401
    ) {
      throw error;
    }
  }

  // Create Appwrite Session
  await account.createSession({
    userId,
    secret,
  });

  // Get Authenticated User
  return account.get();
};