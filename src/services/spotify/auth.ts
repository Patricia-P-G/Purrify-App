// This is for Connecting with the Spotify Account
const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

// --------------------------------------------------- Code Verifier ---------------------------------------------------

const generateRandomString = (length: number) => {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  const values = crypto.getRandomValues(new Uint8Array(length));

  return Array.from(values, (value) => possible[value % possible.length]).join("");
};

// --------------------------------------------------- Code Challenge ---------------------------------------------------

const sha256 = async (plain: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);

  return crypto.subtle.digest("SHA-256", data);
};

const base64encode = (input: ArrayBuffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

// --------------------------------------------------- Authorization ---------------------------------------------------

export async function redirectToSpotify() {
  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  const scope = "user-read-private user-read-email user-read-recently-played user-top-read streaming user-read-playback-state user-modify-playback-state";

  const authUrl = new URL(
    "https://accounts.spotify.com/authorize"
  );

  localStorage.setItem("code_verifier", codeVerifier);

  const params = {
    response_type: "code",
    client_id: clientId,
    scope,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  };

  authUrl.search = new URLSearchParams(params).toString();

  window.location.href = authUrl.toString();
}

// --------------------------------------------------- Save Tokens ---------------------------------------------------

const saveTokens = (data: {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}) => {
  localStorage.setItem("access_token", data.access_token);

  if (data.refresh_token) {
    localStorage.setItem("refresh_token", data.refresh_token);
  }

  const expiresAt = Date.now() + data.expires_in * 1000;

  localStorage.setItem("token_expires_at", expiresAt.toString());
};

// --------------------------------------------------- Access Token ---------------------------------------------------

export async function getToken(code: string) {
  const codeVerifier = localStorage.getItem("code_verifier");

  if (!codeVerifier) {
    throw new Error("No PKCE code verifier found");
  }

  const response = await fetch(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error_description ??
      data?.error ??
      "Spotify token request failed"
    );
  }

  if (!data.access_token) {
    throw new Error("Spotify did not return an access token");
  }

  saveTokens(data);

  localStorage.removeItem("code_verifier");

  return data;
}

// --------------------------------------------------- Refresh Access Token ---------------------------------------------------

let refreshPromise: Promise<string> | null = null;

export async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      throw new Error("No Spotify refresh token found");
    }

    const response = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: clientId,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error_description ??
        data?.error ??
        "Failed to refresh Spotify token"
      );
    }

    if (!data.access_token) {
      throw new Error("Spotify did not return a new access token");
    }

    saveTokens(data);

    return data.access_token as string;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

// --------------------------------------------------- Get Valid Access Token ---------------------------------------------------

export async function getValidAccessToken(): Promise<string> {
  const accessToken = localStorage.getItem("access_token");
  const expiresAt = Number(
    localStorage.getItem("token_expires_at")
  );

  if (
    accessToken &&
    expiresAt &&
    Date.now() < expiresAt - 60_000
  ) {
    return accessToken;
  }

  return refreshAccessToken();
}

// --------------------------------------------------- Clear Tokens ---------------------------------------------------

export function clearSpotifyTokens(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("token_expires_at");
  localStorage.removeItem("code_verifier");
}