import { spotifyFetch } from "@/services/spotify/api/spotifyClient";
import type { Artist } from "@/types/music";

interface SpotifyArtist {
  id: string;
  name: string;
  images?: {
    url: string;
    width: number;
    height: number;
  }[];
}

export async function getTopArtists(): Promise<Artist[]> {
  const data = await spotifyFetch("/me/top/artists?limit=4");
  const artists: SpotifyArtist[] = data.items ?? [];

  return artists
    .filter((artist) => artist.id && artist.name)
    .map((artist) => ({
      id: artist.id,
      name: artist.name,
      image:
        artist.images?.filter((image) => image.url).sort((a, b) => a.width - b.width)[0]?.url ?? "",
    }));
}