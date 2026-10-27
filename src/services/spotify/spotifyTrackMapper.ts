import type { Track } from "@/types/music";

export interface SpotifyTrack {
  id: string;
  uri: string;
  name: string;
  duration_ms: number;
  artists: {
    id: string;
    name: string;
  }[];
  album: {
    id: string;
    name: string;
    images: {
      url: string;
    }[];
  };
}

export function mapSpotifyTrack(track: SpotifyTrack): Track {
  return {
    id: track.id,
    uri: track.uri,
    title: track.name,
    artist: track.artists.map((artist) => artist.name).join(", "),
    artistId: track.artists[0]?.id ?? "",
    artists: track.artists.map((artist) => ({
      id: artist.id,
      name: artist.name,
    })),
    album: track.album.name,
    albumId: track.album.id,
    image: track.album.images.at(-1)?.url ?? "",
    largeImage: track.album.images[0]?.url ?? "",
    duration: track.duration_ms,
  };
}