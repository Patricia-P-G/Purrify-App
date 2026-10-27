import { useFavorites } from "@/composables/useFavorites";
import { useActionToast } from "@/composables/useActionToast";
import type { Track } from "@/types/music";

// --------------------------------------------------- Favorite Actions ---------------------------------------------------

export function useFavoriteActions() {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { triggerToast } = useActionToast();

  const pendingFavorites = new Set<string>();

  // Handle Favorite Click
  const handleFavoriteClick = async (track: Track) => {
    if (pendingFavorites.has(track.id)) return;

    pendingFavorites.add(track.id);

    try {
      const added = await toggleFavorite(track);

      triggerToast({
        type: "favorite",
        action: added ? "added" : "removed",
        trackName: track.title,
      });
    } catch (error) {
      console.error("Failed to update favorite:", error);
    } finally {
      pendingFavorites.delete(track.id);
    }
  };

  return {
    isFavorite,
    handleFavoriteClick,
  };
}