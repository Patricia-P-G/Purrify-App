// Options Needed When Creating a Spotify Player
interface SpotifyPlayerOptions {
  name: string;

  // Gives Spotify the Access Token Needed for Authentication
  getOAuthToken: (callback: (token: string) => void) => void;

  // Starting Volume from 0 to 1
  volume?: number;
}

// Represents the Current Playback State
interface SpotifyPlaybackState {
  position: number;
  duration: number;
  paused: boolean;
}

// Spotify Device Information
interface SpotifyDeviceEvent {
  device_id: string;
}

// Spotify SDK Error Information
interface SpotifyErrorEvent {
  message: string;
}

// Describes the Spotify Player and the Methods Used in Purrify
interface SpotifyPlayer {
  // Connects the Browser Player to Spotify
  connect(): Promise<boolean>;

  // Disconnects the Browser Player
  disconnect(): void;

  // Playback Controls
  togglePlay(): Promise<void>;
  pause(): Promise<void>;
  seek(positionMs: number): Promise<void>;
  setVolume(volume: number): Promise<void>;

  // Runs When Spotify Creates the Playback Device
  addListener(
    event: "ready",
    callback: (data: SpotifyDeviceEvent) => void
  ): boolean;

  // Runs When the Spotify Device Becomes Unavailable
  addListener(
    event: "not_ready",
    callback: (data: SpotifyDeviceEvent) => void
  ): boolean;

  // Runs Whenever the Playback State Changes
  addListener(
    event: "player_state_changed",
    callback: (state: SpotifyPlaybackState | null) => void
  ): boolean;

  // Runs When Spotify Authentication Fails
  addListener(
    event: "authentication_error",
    callback: (data: SpotifyErrorEvent) => void
  ): boolean;

  // Runs When the Spotify Account Cannot Use Playback
  addListener(
    event: "account_error",
    callback: (data: SpotifyErrorEvent) => void
  ): boolean;

  // Runs When Spotify Player Initialization Fails
  addListener(
    event: "initialization_error",
    callback: (data: SpotifyErrorEvent) => void
  ): boolean;

  // Runs When Spotify Playback Fails
  addListener(
    event: "playback_error",
    callback: (data: SpotifyErrorEvent) => void
  ): boolean;
}

// Describes window.Spotify and Its Player Constructor
interface SpotifyNamespace {
  Player: new (options: SpotifyPlayerOptions) => SpotifyPlayer;
}

// Adds Spotify SDK Properties to the Browser Window Type
interface Window {
  Spotify: SpotifyNamespace;

  // Spotify Calls This Function When the Web Playback SDK Is Ready
  onSpotifyWebPlaybackSDKReady: () => void;
}