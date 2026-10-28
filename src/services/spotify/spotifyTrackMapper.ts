import type { Track } from "@/types/music";
import { pickImage } from "@/services/spotify/images";

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
    image: pickImage(track.album.images, "small"),
    largeImage: pickImage(track.album.images, "large"),
    duration: track.duration_ms,
  };
}