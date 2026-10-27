import { ref } from "vue";
import { getValidAccessToken, refreshAccessToken } from "@/services/spotify/auth";

// Spotify Player Instance and Device ID
let player: SpotifyPlayer | null = null;
let deviceId: string | null = null;

// Spotify SDK Initialization
let initializationPromise: Promise<void> | null = null;
let sdkScriptAdded = false;

// Reactive Playback State
export const spotifyPosition = ref(0);
export const spotifyDuration = ref(0);
export const spotifyPaused = ref(true);

// Progress Timer
let progressTimer: ReturnType<typeof setInterval> | null = null;

// Track End Detection
let trackEndCallback: (() => void) | null = null;
let previousStatePaused = true;
let previousPosition = 0;

// Initialization Timeout
const INITIALIZATION_TIMEOUT = 15000;

// Allows the Player to Handle Track End Events
export const onSpotifyTrackEnd = (callback: () => void) => {
  trackEndCallback = callback;
};

// Updates the Playback Position Every Second
const startProgressTimer = () => {
  if (progressTimer) {
    clearInterval(progressTimer);
  }

  progressTimer = setInterval(() => {
    if (
      !spotifyPaused.value &&
      spotifyDuration.value > 0 &&
      spotifyPosition.value < spotifyDuration.value
    ) {
      spotifyPosition.value = Math.min(
        spotifyPosition.value + 1000,
        spotifyDuration.value
      );
    }
  }, 1000);
};

// Stops the Progress Timer
const stopProgressTimer = () => {
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
};

// Resets the Spotify Player
const resetSpotifyPlayer = () => {
  stopProgressTimer();

  if (player) {
    const currentPlayer = player;
    player = null;

    void currentPlayer.disconnect();
  }

  deviceId = null;

  spotifyPosition.value = 0;
  spotifyDuration.value = 0;
  spotifyPaused.value = true;

  previousStatePaused = true;
  previousPosition = 0;
};

// --------------------------------------------------- Create Spotify Player ---------------------------------------------------

const createSpotifyPlayer = ( resolve: () => void, reject: (error: Error) => void) => {
  if (player) {
    return;
  }

  if (!window.Spotify) {
    reject(new Error("Spotify Web Playback SDK is not available"));
    return;
  }

  // Create the Spotify Web Playback SDK Player
  const spotifyPlayer = new window.Spotify.Player({
    name: "Purrify Web Player",

    // Spotify Requests a Valid Access Token When Needed
    getOAuthToken: (callback) => {
      void getValidAccessToken()
        .then((token) => {
          callback(token);
        })
        .catch((error) => {
          console.error("Failed to get Spotify access token:", error);
        });
    },

    volume: 0.5,
  });

  player = spotifyPlayer;

  // Spotify Device Is Ready
  spotifyPlayer.addListener("ready", ({ device_id }) => {
    if (player !== spotifyPlayer) {
      return;
    }

    deviceId = device_id;
    startProgressTimer();
    resolve();
  });

  // Spotify Device Is No Longer Available
  spotifyPlayer.addListener("not_ready", ({ device_id }) => {
    if (player !== spotifyPlayer || deviceId !== device_id) {
      return;
    }

    deviceId = null;
    stopProgressTimer();
    spotifyPaused.value = true;
  });

  // Authentication Error
  spotifyPlayer.addListener("authentication_error", ({ message }) => {
    console.error("Spotify authentication error:", message);
    reject(new Error(message));
    resetSpotifyPlayer();
  });

  // Account Error
  spotifyPlayer.addListener("account_error", ({ message }) => {
    console.error("Spotify account error:", message);
    reject(new Error(message));
    resetSpotifyPlayer();
  });

  // Initialization Error
  spotifyPlayer.addListener("initialization_error", ({ message }) => {
    console.error("Spotify initialization error:", message);
    reject(new Error(message));
    resetSpotifyPlayer();
  });

  // Playback Error
  spotifyPlayer.addListener("playback_error", ({ message }) => {
    console.error("Spotify playback error:", message);
  });

  // Synchronize Playback State with Spotify
  spotifyPlayer.addListener("player_state_changed", (state) => {
    if (!state || player !== spotifyPlayer) {
      return;
    }

    // Detect a Possible Track End
    const trackEnded =
      !previousStatePaused &&
      state.paused &&
      previousPosition > 0 &&
      state.position === 0;

    spotifyPosition.value = state.position;
    spotifyDuration.value = state.duration;
    spotifyPaused.value = state.paused;

    previousStatePaused = state.paused;
    previousPosition = state.position;

    if (trackEnded) {
      trackEndCallback?.();
    }
  });

  // Connect the Player to Spotify
  void spotifyPlayer.connect()
    .then((success) => {
      if (!success) {
        throw new Error("Purrify could not connect to Spotify");
      }
    })
    .catch((error: unknown) => {
      if (player !== spotifyPlayer) {
        return;
      }

      const message =
        error instanceof Error
          ? error.message
          : "Failed to connect to Spotify";

      resetSpotifyPlayer();
      reject(new Error(message));
    });
};

// --------------------------------------------------- Initialize Spotify Player ---------------------------------------------------

export const initializeSpotifyPlayer = (): Promise<void> => {
  // Player Is Already Ready
  if (deviceId) {
    return Promise.resolve();
  }

  // Reuse an Existing Initialization Request
  if (initializationPromise) {
    return initializationPromise;
  }

  if (!localStorage.getItem("access_token") && !localStorage.getItem("refresh_token")) {
    return Promise.reject(
      new Error("No Spotify token found")
    );
  }

  initializationPromise = new Promise<void>((resolve, reject) => {
    let settled = false;

    // Prevent Initialization from Waiting Forever
    const timeout = setTimeout(() => {
      fail(new Error("Spotify player initialization timed out"));
    }, INITIALIZATION_TIMEOUT);

    const succeed = () => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      initializationPromise = null;
      resolve();
    };

    const fail = (error: Error) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      initializationPromise = null;
      resetSpotifyPlayer();
      reject(error);
    };

    // SDK Already Loaded
    if (window.Spotify) {
      createSpotifyPlayer(succeed, fail);
      return;
    }

    // Create the Player When Spotify SDK Loads
    window.onSpotifyWebPlaybackSDKReady = () => {
      createSpotifyPlayer(succeed, fail);
    };

    // Reuse an Existing SDK Script
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://sdk.scdn.co/spotify-player.js"]'
    );

    if (existingScript) {
      sdkScriptAdded = true;
      return;
    }

    if (!sdkScriptAdded) {
      const script = document.createElement("script");

      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;

      // Handle SDK Loading Errors
      script.onerror = () => {
        sdkScriptAdded = false;
        script.remove();

        fail(new Error("Failed to load Spotify Web Playback SDK"));
      };

      document.body.appendChild(script);
      sdkScriptAdded = true;
    }
  });

  return initializationPromise;
};

// --------------------------------------------------- Play Track ---------------------------------------------------

export const playSpotifyTrack = async (uri: string) => {
  // Initialize Spotify Only When Playback Is Requested
  if (!deviceId) {
    await initializeSpotifyPlayer();
  }

  if (!deviceId) {
    throw new Error("Purrify Spotify player is not ready");
  }

  // Start Playback on the Purrify Device
  const sendPlaybackRequest = async (token: string) => {
    return fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${encodeURIComponent(deviceId!)}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [uri],
        }),
      }
    );
  };

  const accessToken = await getValidAccessToken();

  let response = await sendPlaybackRequest(accessToken);

  // Refresh the Token if Spotify Returns Unauthorized
  if (response.status === 401) {
    const newAccessToken = await refreshAccessToken();

    response = await sendPlaybackRequest(newAccessToken);
  }

  if (!response.ok) {
    // Spotify May Return an Empty or Non-JSON Error Body
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.error?.message ??
      `Spotify playback failed (${response.status})`
    );
  }
};

// --------------------------------------------------- Playback Controls ---------------------------------------------------

// Toggles Between Play and Pause
export const toggleSpotifyPlayback = async () => {
  if (!player || !deviceId) {
    throw new Error("Purrify Spotify player is not ready");
  }

  await player.togglePlay();
};

// Pauses the Current Track
export const pauseSpotifyPlayback = async () => {
  if (!player || !deviceId) {
    throw new Error("Purrify Spotify player is not ready");
  }

  await player.pause();
};

// Moves Playback to a Specific Position in Milliseconds
export const seekSpotifyPlayback = async (positionMs: number) => {
  if (!player || !deviceId) {
    throw new Error("Purrify Spotify player is not ready");
  }

  await player.seek(positionMs);
};

// Changes Spotify Player Volume from 0 to 1
export const setSpotifyVolume = async (volume: number) => {
  if (!player || !deviceId) {
    throw new Error("Purrify Spotify player is not ready");
  }

  await player.setVolume(Math.min(1, Math.max(0, volume)));
};