<template>
  <button type="button" :aria-label="favorite ? `Remove ${track.title} from favorites` : `Add ${track.title} to favorites`"
   :aria-pressed="favorite"
   class="flex shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform duration-200 hover:scale-110
   focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
   motion-reduce:transform-none motion-reduce:transition-none"
   :class="sizeClasses[size].button" @click="handleFavoriteClick(track)">
    <img :src="favorite ? favoriteActiveIcon : favoriteIcon" alt="" aria-hidden="true"
     :width="sizeClasses[size].iconSize" :height="sizeClasses[size].iconSize" :class="sizeClasses[size].icon"/>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useFavoriteActions } from "@/composables/useFavoritesActions";
import favoriteIcon from "@/assets/icons/favorites.svg";
import favoriteActiveIcon from "@/assets/icons/favorites-hover.svg";
import type { Track } from "@/types/music";

const props = withDefaults(
  defineProps<{
    track: Track;
    size?: "sm" | "md" | "lg";
  }>(),
  { size: "md" }
);

const { isFavorite, handleFavoriteClick } = useFavoriteActions();

const favorite = computed(() => isFavorite(props.track.id));

const sizeClasses = {
  sm: { button: "h-9 w-9 active:scale-95", icon: "h-5 w-5", iconSize: 20 },
  md: { button: "h-10 w-10 active:scale-95", icon: "h-5 w-5", iconSize: 20 },
  lg: { button: "h-11 w-11 active:scale-90", icon: "h-6 w-6", iconSize: 24 },
};
</script>
