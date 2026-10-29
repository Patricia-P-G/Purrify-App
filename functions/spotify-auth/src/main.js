import { Client, Users } from "node-appwrite";
import { createHash } from "node:crypto";

export default async ({ req, res, error }) => {
  // Only Allow POST Requests
  if (req.method !== "POST") {
    return res.json({ error: "Method not allowed" }, 405);
  }

  try {
    const { accessToken } = req.bodyJson ?? {};

    if (typeof accessToken !== "string" || !accessToken) {
      return res.json({ error: "Missing Spotify access token" }, 400);
    }

    // Verify Spotify User
    const spotifyResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!spotifyResponse.ok) {
      return res.json({ error: "Invalid Spotify access token" }, 401);
    }

    const spotifyUser = await spotifyResponse.json();

    if (typeof spotifyUser.id !== "string" || !spotifyUser.id) {
      return res.json({ error: "Invalid Spotify user" }, 401);
    }

    // Initialize Appwrite
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(req.headers["x-appwrite-key"]);

    const users = new Users(client);

    // Generate Stable Appwrite User ID
    const hash = createHash("sha256")
      .update(spotifyUser.id)
      .digest("hex");

    const userId = `spotify_${hash.slice(0, 28)}`;

    // Find or Create User
    try {
      await users.get({ userId });
    } catch (err) {
      if (err.code !== 404) {
        throw err;
      }

      try {
        await users.create({
          userId,
          name: spotifyUser.display_name || "Purrify User",
        });
      } catch (createError) {
        if (createError.code !== 409) {
          throw createError;
        }
      }
    }

    // Create Appwrite Login Token
    const token = await users.createToken({
      userId,
      length: 32,
      expire: 900,
    });

    return res.json({
      userId,
      secret: token.secret,
    });
  } catch (err) {
    error(`Spotify authentication failed: ${err.message}`);

    return res.json({ error: "Authentication failed" }, 500);
  }
};
