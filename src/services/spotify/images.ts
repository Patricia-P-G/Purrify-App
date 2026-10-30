interface SpotifyImage {
  url: string;
}

type ImageSize = "small" | "medium" | "large";

// Spotify lists images from largest to smallest
export function pickImage(images: SpotifyImage[] | undefined, size: ImageSize = "large"): string {
  if (!images?.length) return "";

  if (size === "large") return images[0]?.url ?? "";
  if (size === "small") return images.at(-1)?.url ?? "";

  return (images[1] ?? images[0])?.url ?? "";
}