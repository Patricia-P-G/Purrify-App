<template>
  <!-- Desktop + Tablet Sidebar -->
  <aside class="fixed bottom-0 left-0 top-0 z-40 hidden bg-background md:flex md:w-24 md:flex-col md:p-3 lg:w-64 lg:p-6">
    <!-- Logo -->
    <RouterLink to="/home" aria-label="Purrify home" class="mb-8 flex justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:block">
      <img :src="purrifySmallLogo" alt="" aria-hidden="true" class="w-30 lg:hidden"/>
      <img :src="purrifyLogo" alt="" aria-hidden="true" class="hidden w-20 lg:block lg:w-auto"/>
    </RouterLink>

    <!-- Navigation -->
    <nav aria-label="Main navigation" class="flex flex-col gap-3">
      <RouterLink v-for="link in mainLinks" :key="link.path" :to="link.path" custom v-slot="{ href, navigate, isActive }">
        <a :href="href" :aria-current="isActive ? 'page' : undefined" :aria-label="link.name" @click="navigate"
          :class="[
            'group flex items-center justify-center gap-3 rounded-xl px-3 py-3 transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none lg:justify-start lg:px-4',
          isActive 
            ? 'bg-primary-light text-primary' 
            : 'text-primary-text hover:bg-primary-light hover:text-primary']">

          <img v-if="isActive" :src="link.hoverIcon" alt="" aria-hidden="true" width="24" height="24" class="h-6 w-6"/>
          <img v-else :src="link.icon" alt="" aria-hidden="true" width="24" height="24" class="h-6 w-6 group-hover:hidden"/>
          <img v-if="!isActive" :src="link.hoverIcon" alt="" aria-hidden="true" width="24" height="24" class="hidden h-6 w-6 group-hover:block"/>
          <span class="hidden text-lg lg:block">{{ link.name }}</span>
        </a>
      </RouterLink>

      <!-- Library -->
      <p class="hidden pt-5 font-medium text-text-secondary lg:block">
        Your library
      </p>

      <div class="my-2 border-t border-border-pink lg:hidden" aria-hidden="true"></div>

      <RouterLink v-for="link in libraryLinks" :key="link.path" :to="link.path" custom v-slot="{ href, navigate, isActive }">
        <a :href="href" :aria-current="isActive ? 'page' : undefined" :aria-label="link.name" @click="navigate"
          :class="[
            'group flex items-center justify-center gap-3 rounded-xl px-3 py-3 transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none lg:justify-start lg:px-4',
            isActive
              ? 'bg-primary-light text-primary'
              : 'text-primary-text hover:bg-primary-light hover:text-primary'
          ]">

          <img v-if="isActive" :src="link.hoverIcon" alt="" aria-hidden="true" width="24" height="24" class="h-6 w-6"/>
          <img v-else :src="link.icon" alt="" aria-hidden="true" width="24" height="24" class="h-6 w-6 group-hover:hidden"/>
          <img v-if="!isActive" :src="link.hoverIcon" alt="" aria-hidden="true" width="24" height="24" class="hidden h-6 w-6 group-hover:block"/>
          <span class="hidden text-lg lg:block">{{ link.name }}</span>
        </a>
      </RouterLink>
    </nav>
  </aside>

  <!-- Mobile Bottom Navigation -->
  <nav aria-label="Mobile navigation" class="fixed bottom-0 left-0 right-0 z-50 flex w-full items-center border-t border-border-pink bg-background md:hidden">
    <RouterLink v-for="link in mobileLinks" :key="link.path" :to="link.path" custom v-slot="{ href, navigate, isActive }">
      <a :href="href" :aria-current="isActive ? 'page' : undefined" @click="navigate"
        :class="[
          'group flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs transition duration-200 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none',
          isActive
            ? 'bg-primary-light font-semibold text-primary'
            : 'text-primary-text hover:bg-primary-light hover:text-primary'
        ]">

        <img v-if="isActive" :src="link.hoverIcon" alt="" aria-hidden="true" width="20" height="20" class="h-5 w-5"/>
        <img v-else :src="link.icon" alt="" aria-hidden="true" width="20" height="20" class="h-5 w-5 group-hover:hidden"/>
        <img v-if="!isActive" :src="link.hoverIcon" alt="" aria-hidden="true" width="20" height="20" class="hidden h-5 w-5 group-hover:block"/>
        <span>{{ link.name }}</span>
      </a>
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
import purrifyLogo from "@/assets/icons/purrify-logo.svg";
import purrifySmallLogo from "@/assets/icons/purrify-small-logo.svg";
import homeIcon from "@/assets/icons/home-icon.svg";
import homeHoverIcon from "@/assets/icons/home-hover-icon.svg";
import magnifyingGlassIcon from "@/assets/icons/magnifying-glass-navigation.svg";
import magnifyingGlassHoverIcon from "@/assets/icons/magnifying-glass-hover.svg";
import discoverIcon from "@/assets/icons/discover.svg";
import discoverHoverIcon from "@/assets/icons/discover-hover.svg";
import playlistsIcon from "@/assets/icons/playlists.svg";
import playlistsHoverIcon from "@/assets/icons/playlists-hover.svg";
import favoritesIcon from "@/assets/icons/favorites.svg";
import favoritesHoverIcon from "@/assets/icons/favorites-hover.svg";

interface NavLink {
  name: string;
  path: string;
  icon: string;
  hoverIcon: string;
}

const mainLinks: NavLink[] = [
  {
    name: "Home",
    path: "/home",
    icon: homeIcon,
    hoverIcon: homeHoverIcon,
  },
  {
    name: "Search",
    path: "/search",
    icon: magnifyingGlassIcon,
    hoverIcon: magnifyingGlassHoverIcon,
  },
  {
    name: "Discover",
    path: "/discover",
    icon: discoverIcon,
    hoverIcon: discoverHoverIcon,
  },
];

const libraryLinks: NavLink[] = [
  {
    name: "Playlists",
    path: "/playlists",
    icon: playlistsIcon,
    hoverIcon: playlistsHoverIcon,
  },
  {
    name: "Favorites",
    path: "/favorites",
    icon: favoritesIcon,
    hoverIcon: favoritesHoverIcon,
  },
];

const mobileLinks: NavLink[] = [
  ...mainLinks,
  ...libraryLinks,
];

</script>