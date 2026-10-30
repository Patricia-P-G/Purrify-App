<template>
    <!-- Search Preview Dropdown -->
    <div role="region" aria-label="Search suggestions" class="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-3xl border border-border-pink
     bg-surface p-3 shadow-[0_16px_45px_rgba(75,75,85,0.20)]">

        <!-- Loading State -->
        <div v-if="isSearching" class="px-4 py-8 text-center text-sm text-text-muted" role="status" aria-live="polite">
            Searching...
        </div>

        <!-- Search Results -->
        <template v-else-if="topArtist || tracks.length">
            <!-- Top Artist Result -->
            <section v-if="topArtist" aria-labelledby="search-top-result-heading">
                <h2 id="search-top-result-heading" class="px-3 pb-2 pt-1 text-sm font-semibold text-secondary">
                    Top result
                </h2>

                <!-- Artist Button -->
                <button type="button"
                    class="group flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-primary-pale p-3 text-left
                    transition duration-200 hover:bg-primary-light focus-visible:outline-2 focus-visible:outline-offset-2
                    focus-visible:outline-primary active:scale-[0.99] motion-reduce:transform-none motion-reduce:transition-none"
                    @click="emits('artist-click', topArtist.id)">

                    <!-- Artist Image -->
                    <img v-if="topArtist.image" :src="topArtist.image" :alt="`${topArtist.name} profile picture`"
                        loading="lazy" decoding="async" width="48" height="48"
                        class="h-12 w-12 shrink-0 rounded-full object-cover shadow-[0_4px_10px_rgba(75,75,85,0.14)]"
                    />

                    <!-- Artist Image Fallback -->
                    <div v-else class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-light"
                        aria-hidden="true">
                        <img src="@/assets/icons/music.svg" alt="" class="h-5 w-5"/>
                    </div>

                    <!-- Artist Information -->
                    <div class="min-w-0 flex-1">
                        <h3 class="truncate text-sm font-semibold text-primary-text transition-colors duration-200
                            group-hover:text-primary motion-reduce:transition-none">
                            {{ topArtist.name }}
                        </h3>

                        <p class="mt-0.5 text-xs text-text-secondary">
                            Artist
                        </p>
                    </div>

                    <!-- Arrow -->
                    <span aria-hidden="true"
                        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light
                        shadow-[0_4px_10px_rgba(75,75,85,0.10)] transition duration-200 group-hover:scale-105
                        group-hover:bg-primary motion-reduce:transform-none motion-reduce:transition-none">

                        <img src="@/assets/icons/arrow-right-icon.svg" alt="" class="block h-4 w-4 group-hover:hidden"/>
                        <img src="@/assets/icons/arrow-right-hover-icon.svg" alt="" class="hidden h-4 w-4 group-hover:block"/>
                    </span>
                </button>
            </section>

            <!-- Song Results -->
            <section v-if="tracks.length" class="mt-4" aria-labelledby="search-preview-songs-heading">
                <h2 id="search-preview-songs-heading" class="px-3 pb-2 text-sm font-semibold text-secondary">
                    Songs
                </h2>

                <ul>
                    <li v-for="track in tracks" :key="track.id">
                        <button type="button"
                            class="group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left
                            transition duration-200 hover:bg-primary-pale focus-visible:outline-2 focus-visible:outline-offset-2
                            focus-visible:outline-primary active:scale-[0.99] motion-reduce:transform-none motion-reduce:transition-none"
                            @click="emits('track-click', track)">

                            <!-- Album Cover -->
                            <img v-if="track.image" :src="track.image" :alt="`${track.title} album cover`"
                                loading="lazy" decoding="async" width="40" height="40"
                                class="h-10 w-10 shrink-0 rounded-lg object-cover shadow-[0_3px_8px_rgba(75,75,85,0.12)]"
                            />

                            <!-- Album Cover Fallback -->
                            <div v-else class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-light"
                                aria-hidden="true">
                                <img src="@/assets/icons/music.svg" alt="" class="h-4 w-4"/>
                            </div>

                            <!-- Song Information -->
                            <div class="min-w-0 flex-1">
                                <h3 class="truncate text-sm font-semibold transition-colors duration-200 motion-reduce:transition-none"
                                    :class="isCurrentTrack(track) ? 'text-primary' : 'text-primary-text group-hover:text-primary'">
                                    {{ track.title }}
                                </h3>

                                <p class="mt-0.5 truncate text-xs text-text-secondary">
                                    {{ track.artist }}
                                </p>
                            </div>

                            <!-- Playback State - Only Visible for the Selected Track -->
                            <PlayButton v-if="isCurrentTrack(track)" :active="true" :playing="isPlaying"/>
                        </button>
                    </li>
                </ul>
            </section>

            <!-- See All Results -->
            <button type="button"
                class="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 border-t border-border px-4
                pb-2 pt-4 text-sm font-semibold text-primary transition duration-200 hover:text-primary-hover
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none"
                @click="emits('see-all')">
                See all results
            </button>
        </template>

        <!-- Empty State -->
        <div v-else class="px-4 py-8 text-center text-sm text-text-muted" role="status" aria-live="polite">
            No results found.
        </div>
    </div>
</template>

<script setup lang="ts">
import PlayButton from "@/components/music/PlayButton.vue";
import type { Track } from "@/types/music";
import type { SearchArtist } from "@/services/spotify/api/search";

// Data received from the parent
const props = defineProps<{
    isSearching: boolean;
    topArtist: SearchArtist | null;
    tracks: Track[];
    currentTrackId?: string;
    isPlaying: boolean;
}>();

// Events sent back to the parent
const emits = defineEmits<{
    "artist-click": [artistId: string];
    "track-click": [track: Track];
    "see-all": [];
}>();

// Checks if this is the current track
const isCurrentTrack = (track: Track) => {
    return props.currentTrackId === track.id;
};

</script>