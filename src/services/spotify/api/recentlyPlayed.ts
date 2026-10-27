import { spotifyFetch } from "@/services/spotify/api/spotifyClient";
import { mapSpotifyTrack, type SpotifyTrack } from "@/services/spotify/spotifyTrackMapper";
import type { RecentlyPlayedTrack } from "@/types/music";

interface SpotifyRecentlyPlayedItem {
  played_at: string;
  track: SpotifyTrack;
}

export async function getRecentlyPlayed(limit = 50): Promise<RecentlyPlayedTrack[]> {
  const data = await spotifyFetch(`/me/player/recently-played?limit=${limit}`);
  const items: SpotifyRecentlyPlayedItem[] = data.items ?? [];

  return items
    .filter((item) => item.track.id && item.track.uri)
    .map((item) => ({
      ...mapSpotifyTrack(item.track),
      artists: item.track.artists.map((artist) => ({
        id: artist.id,
        name: artist.name,
      })),
      largeImage:
        item.track.album.images[1]?.url ??
        item.track.album.images[0]?.url ??
        "",
      playedAt: item.played_at,
    }));
}