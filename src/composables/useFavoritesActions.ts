import { useFavorites } from "@/composables/useFavorites";
import { useActionToast } from "@/composables/useActionToast";
import type { Track } from "@/types/music";

// --------------------------------------------------- Favorite Actions ---------------------------------------------------

export function useFavoriteActions() {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { triggerToast } = useActionToast();

  // Handle Favorite Click
  const handleFavoriteClick = async (track: Track) => {
    try {
      const added = await toggleFavorite(track);

      // An in-progress operation did not change this favorite.
      if (added === null) return;

      triggerToast({
        type: "favorite",
        action: added ? "added" : "removed",
        trackName: track.title,
      });
    } catch (error) {
      console.error("Failed to update favorite:", error);
    }
  };

  return {
    isFavorite,
    handleFavoriteClick,
  };
}