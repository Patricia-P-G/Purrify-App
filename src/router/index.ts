
import { createRouter, createWebHistory } from "vue-router";
import { account } from "@/services/appwrite/client";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    // Login
    {
      path: "/",
      name: "login",
      component: () => import("@/features/auth/LoginView.vue"),
    },

    // Home
    {
      path: "/home",
      name: "home",
      component: () => import("@/features/home/HomeView.vue"),
      meta: { requiresAuth: true },
    },

    // Search
    {
      path: "/search",
      name: "search",
      component: () => import("@/features/search/SearchView.vue"),
      meta: { requiresAuth: true },
    },

    // Playlists
    {
      path: "/playlists",
      name: "playlists",
      component: () => import("@/features/playlists/PlaylistsView.vue"),
      meta: { requiresAuth: true },
    },

    // Single Playlist
    {
      path: "/playlists/:id",
      name: "playlist",
      component: () => import("@/features/playlists/SinglePlaylistView.vue"),
      props: true,
      meta: { requiresAuth: true },
    },

    // Artists
    {
      path: "/artists/:id",
      name: "artist",
      component: () => import("@/features/catalog/ArtistView.vue"),
      props: true,
      meta: { requiresAuth: true },
    },

    // Albums
    {
      path: "/albums/:id",
      name: "album",
      component: () => import("@/features/catalog/AlbumView.vue"),
      props: true,
      meta: { requiresAuth: true },
    },

    // Discover
    {
      path: "/discover",
      name: "discover",
      component: () => import("@/features/discover/DiscoverView.vue"),
      meta: { requiresAuth: true },
    },

    // Genre Playlists
    {
      path: "/discover/:genre",
      name: "genre",
      component: () => import("@/features/discover/GenreView.vue"),
      props: true,
      meta: { requiresAuth: true },
    },

    // Favorites
    {
      path: "/favorites",
      name: "favorites",
      component: () => import("@/features/favorites/FavoritesView.vue"),
      meta: { requiresAuth: true },
    },

    // Recently Played
    {
      path: "/recently-played",
      name: "recently-played",
      component: () => import("@/features/recently-played/RecentlyPlayedView.vue"),
      meta: { requiresAuth: true },
    },

    // Spotify Callback
    {
      path: "/callback",
      name: "callback",
      component: () => import("@/features/auth/CallbackView.vue"),
    },

    // Not Found
    {
      path: "/:pathMatch(.*)*",
      redirect: "/home",
    },
  ],
});

// Protect Routes That Require Authentication
router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true;

  try {
    // Verify Active Appwrite Session
    await account.get();
    return true;
  } catch (error: unknown) {
    // Redirect Only When the Session Is Invalid
    const status =
      typeof error === "object" &&
      error !== null &&
      "code" in error
        ? (error as { code?: number }).code
        : undefined;

    if (status === 401) {
      return {
        name: "login",
        query: { redirect: to.fullPath },
      };
    }

    // Keep the Current Page on Network or Server Errors
    console.error("Failed to verify Appwrite session:", error);
    return false;
  }
});

export default router;