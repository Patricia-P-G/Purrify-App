<template>
  <template v-if="currentTrack">
    <DesktopPlayer :track="currentTrack" :artists="artists"/>
    <MiniPlayer v-if="!isMobilePlayerOpen" :track="currentTrack" :artists="artists" @open="isMobilePlayerOpen = true"/>
    <FullPlayer v-else :track="currentTrack" :artists="artists" @close="isMobilePlayerOpen = false"/>
  </template>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { usePlayer } from "@/composables/usePlayer";
import { getTrackArtists } from "@/utils/trackArtists";
import DesktopPlayer from "@/components/music/player/DesktopPlayer.vue";
import MiniPlayer from "@/components/music/player/MiniPlayer.vue";
import FullPlayer from "@/components/music/player/FullPlayer.vue";

// Chooses which player layout to show. Each layout handles its own controls.
const { currentTrack } = usePlayer();

const isMobilePlayerOpen = ref(false);

const artists = computed(() => (currentTrack.value ? getTrackArtists(currentTrack.value) : []));

</script>