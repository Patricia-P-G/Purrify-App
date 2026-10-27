import { getValidAccessToken, refreshAccessToken } from "@/services/spotify/auth";

let rateLimitedUntil = 0;

export async function spotifyFetch(endpoint: string) {
  // Prevents new requests during a temporary Spotify rate limit
  if (Date.now() < rateLimitedUntil) {
    const secondsLeft = Math.ceil(
      (rateLimitedUntil - Date.now()) / 1000
    );

    throw new Error(
      `Spotify rate limit active. Try again in ${secondsLeft} seconds.`
    );
  }

  // Gets a valid Spotify access token
  const accessToken = await getValidAccessToken();

  const fetchWithToken = (token: string) => {
    return fetch(
      `https://api.spotify.com/v1${endpoint}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

  let response = await fetchWithToken(accessToken);

  // Refreshes the token if Spotify returns unauthorized
  if (response.status === 401) {
    const newAccessToken = await refreshAccessToken();

    response = await fetchWithToken(newAccessToken);
  }

  const data = await response.json();

  // Handles Spotify quota limits separately
  if (
    response.status === 429 &&
    data?.error?.reason === "QUOTA_EXCEEDED"
  ) {
    console.error("SPOTIFY QUOTA EXCEEDED:", {
      endpoint,
      reason: data.error.reason,
    });

    throw new Error(
      "Spotify API quota exceeded."
    );
  }

  // Handles temporary Spotify rate limiting
  if (response.status === 429) {
    const retryAfterHeader =
      response.headers.get("Retry-After");

    const retryAfter = Number(retryAfterHeader);

    const waitSeconds =
      Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter
        : 30;

    rateLimitedUntil =
      Date.now() + waitSeconds * 1000;

    console.error("SPOTIFY RATE LIMIT:", {
      endpoint,
      retryAfter: retryAfterHeader,
      waitingFor: waitSeconds,
    });

    throw new Error(
      `Spotify rate limit reached. Try again in ${waitSeconds} seconds.`
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.error?.message ?? "Spotify request failed"
    );
  }

  return data;
}