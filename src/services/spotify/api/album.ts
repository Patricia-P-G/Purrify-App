import { spotifyFetch } from "@/services/spotify/api/spotifyClient";
import { mapSpotifyTrack, type SpotifyTrack } from "@/services/spotify/spotifyTrackMapper";
import type { Track } from "@/types/music";

export interface AlbumDetails {
  id: string;
  name: string;
  artist: string;
  image: string;
  tracks: Track[];
}

interface SpotifyAlbum {
  id: string;
  name: string;
  images: {
    url: string;
  }[];
  artists: {
    id: string;
    name: string;
  }[];
  tracks: {
    items: SpotifyTrack[];
  };
}

// Gets the selected album and its songs from Spotify
export async function getAlbum(albumId: string): Promise<AlbumDetails> {
  const album = (await spotifyFetch(`/albums/${albumId}`)) as SpotifyAlbum;

  const tracks = album.tracks.items.map((track): Track => {
    const mappedTrack = mapSpotifyTrack({
      ...track,

      album: {
        id: album.id,
        name: album.name,
        images: album.images,
      },
    });

    return mappedTrack;
  });

  return {
    id: album.id,
    name: album.name,
    artist: album.artists.map((artist) => artist.name).join(", "),
    image: album.images?.[0]?.url ?? "",
    tracks,
  };
}