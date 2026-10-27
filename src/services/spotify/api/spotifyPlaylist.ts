import { spotifyFetch } from "@/services/spotify/api/spotifyClient";
import { mapSpotifyTrack, type SpotifyTrack } from "@/services/spotify/spotifyTrackMapper";
import type { Track } from "@/types/music";

export interface SpotifyPlaylistDetails {
  id: string;
  name: string;
  description: string;
  cover: string | null;
  tracks: Track[];
  tracksUnavailable?: boolean;
  hasMore: boolean;
  nextOffset: number;
}

interface SpotifyPlaylistResponse {
  id: string;
  name: string;
  description: string | null;
  images: {
    url: string;
  }[];
}

interface SpotifyPlaylistItem {
  item: SpotifyTrack | null;
}

interface SpotifyPlaylistItemsResponse {
  items: SpotifyPlaylistItem[];
  next: string | null;
}

// Fetches 10 Spotify Playlist Tracks at a Time
export async function getSpotifyPlaylistTracks(playlistId: string, offset = 0) {
  const trackData = (await spotifyFetch(
    `/playlists/${encodeURIComponent(playlistId)}/items?limit=10&offset=${offset}`
  )) as SpotifyPlaylistItemsResponse;

  // Map Spotify Tracks
  const tracks = (trackData.items ?? [])
    .filter(
      (playlistItem): playlistItem is { item: SpotifyTrack } =>
        Boolean(playlistItem.item?.id && playlistItem.item?.uri)
    )
    .map((playlistItem) => mapSpotifyTrack(playlistItem.item));

  return {
    tracks,
    hasMore: Boolean(trackData.next),
    nextOffset: offset + (trackData.items?.length ?? 0),
  };
}

// Gets the Selected Spotify Playlist and Its First 10 Tracks
export async function getSpotifyPlaylist(playlistId: string): Promise<SpotifyPlaylistDetails> {
  // Fetch Playlist Information
  const playlist = (await spotifyFetch(
    `/playlists/${encodeURIComponent(playlistId)}`
  )) as SpotifyPlaylistResponse;

  let tracks: Track[] = [];
  let tracksUnavailable = false;
  let hasMore = false;
  let nextOffset = 0;

  // Fetch First 10 Playlist Tracks
  try {
    const firstPage = await getSpotifyPlaylistTracks(playlistId);

    tracks = firstPage.tracks;
    hasMore = firstPage.hasMore;
    nextOffset = firstPage.nextOffset;
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      tracksUnavailable = true;
    } else {
      throw error;
    }
  }

  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description ?? "",
    cover: playlist.images?.[0]?.url ?? null,
    tracks,
    tracksUnavailable,
    hasMore,
    nextOffset,
  };
}