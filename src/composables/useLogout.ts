import { ref } from "vue";
import { useRouter } from "vue-router";
import { endSession } from "@/services/appwrite/session";
import { clearSpotifyTokens } from "@/services/spotify/auth";
import { clearRecommendationsCache } from "@/services/spotify/api/recommendedForYou";
import { clearMadeForYouCache } from "@/services/spotify/api/madeForYou";
import { useFavorites } from "@/composables/useFavorites";
import { usePlaylists } from "@/composables/usePlaylists";

// Single place that logs the user out of Appwrite and Spotify
export function useLogout() {
  const router = useRouter();
  const { resetFavorites } = useFavorites();
  const { resetPlaylists } = usePlaylists();

  const isLoggingOut = ref(false);

  const logout = async (): Promise<boolean> => {
    if (isLoggingOut.value) return false;

    isLoggingOut.value = true;

    try {
      await endSession();
      clearSpotifyTokens();
      clearRecommendationsCache();
      clearMadeForYouCache();

      // Clear local state without deleting any Appwrite data
      resetFavorites();
      resetPlaylists();

      await router.replace("/");
      return true;
    } catch (error) {
      console.error("Logout failed:", error);
      return false;
    } finally {
      isLoggingOut.value = false;
    }
  };

  return { isLoggingOut, logout };
}