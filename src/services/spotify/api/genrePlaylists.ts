import { spotifyFetch } from "@/services/spotify/api/spotifyClient";

export interface GenrePlaylist {
  id: string;
  name: string;
  description: string;
  image: string;
  owner: string;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: {
    url: string;
  }[];
  owner: {
    display_name: string;
  };
}

const genreQueries: Record<string, string> = {
  Pop: "pop hits", "K-Pop": "k-pop",
  Chill: "chill", "Hip Hop": "hip hop",
  Indie: "indie",
  Rock: "rock", "R&B": "r&b",
  Jazz: "jazz", "Lo-fi": "lofi",
  Electronic: "electronic",
  Classical: "classical",
  Acoustic: "acoustic",
};

const genreKeywords: Record<string, string[]> = {
  Pop: ["pop"],
  "K-Pop": ["k-pop", "kpop", "korean", "korea"],
  Chill: ["chill", "relax"],
  "Hip Hop": ["hip hop", "hip-hop", "rap"],
  Indie: ["indie"],
  Rock: ["rock"],
  "R&B": ["r&b", "rnb", "rhythm and blues"],
  Jazz: ["jazz"],
  "Lo-fi": ["lofi", "lo-fi"],
  Electronic: ["electronic", "edm", "dance"],
  Classical: ["classical", "classic"],
  Acoustic: ["acoustic"],
};

// Checks if the Spotify playlist actually matches the selected genre
function matchesGenre(playlist: SpotifyPlaylist, genre: string): boolean {
  const keywords = genreKeywords[genre];

  if (!keywords) {
    return true;
  }

  const searchableText = `
    ${playlist.name}
    ${playlist.description ?? ""}
  `.toLowerCase();

  return keywords.some((keyword) => searchableText.includes(keyword.toLowerCase()));
}

// Gets Spotify playlists based on the selected genre
export async function getGenrePlaylists(genre: string, limit = 10): Promise<GenrePlaylist[]> {
  const query = genreQueries[genre] ?? genre;

  const data = await spotifyFetch(
    `/search?q=${encodeURIComponent(query)}&type=playlist&limit=${limit}`,
  );

  const playlists: SpotifyPlaylist[] = data.playlists?.items ?? [];

  return playlists
    .filter((playlist) => playlist?.id)
    .filter((playlist) => matchesGenre(playlist, genre))
    .map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      description: playlist.description ?? "",
      image: playlist.images?.[0]?.url ?? "",
      owner: playlist.owner?.display_name ?? "Spotify",
    }));
}