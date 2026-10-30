<template>
    <div ref="menuContainer" class="relative flex justify-end">
        <!-- Dots Menu Button -->
        <button ref="menuButton" type="button" :id="`track-menu-button-${index}`" :aria-label="`More options for ${track.title}`" :aria-expanded="isOpen"
         :aria-controls="isOpen ? `track-menu-${index}` : undefined" aria-haspopup="menu"
         class="menu-trigger" :class="isOpen ? 'bg-primary-pale text-primary' : ''" @click.stop="emit('toggle')">

         <!-- Dots Icon -->
         <img src="@/assets/icons/dots-icon.svg" alt="" aria-hidden="true" class="h-5 w-5"/>
        </button>

        <!-- Dots Menu Container -->
        <div v-if="isOpen" :id="`track-menu-${index}`" role="menu" :aria-labelledby="`track-menu-button-${index}`"
         class="menu-dropdown right-0" :class="openUpwards ? 'bottom-11' : 'top-11'" @click.stop @keydown.esc="emit('toggle')">

            <!-- Add to Playlist -->
            <button type="button" role="menuitem" class="menu-item" @click.stop="emit('addToPlaylist')">

                <span class="menu-icon" aria-hidden="true">
                    <img src="@/assets/icons/add-playlist.svg" class="h-4 w-4" alt=""/>
                </span>

                <span>Add to playlist</span>
            </button>

            <!-- Create Playlist -->
            <button type="button" role="menuitem" class="menu-item mt-1" @click.stop="emit('createPlaylist')">

                <span class="menu-icon" aria-hidden="true">
                    <img src="@/assets/icons/create-playlist.svg" class="h-4 w-4" alt=""/>
                </span>

                <span>Create a playlist</span>
            </button>

            <!-- Remove from Playlist -->
            <button v-if="allowRemove" type="button" role="menuitem" class="menu-item menu-item-danger mt-1" @click.stop="emit('remove')">

                <span class="menu-icon" aria-hidden="true">
                    <img src="@/assets/icons/remove-song.svg" alt="" class="h-4 w-4"/>
                </span>

                <span>Remove from playlist</span>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch, onMounted, onBeforeUnmount } from "vue";
import type { Track } from "@/types/music";

const props = defineProps<{
  track: Track;
  index: number;
  isOpen: boolean;
  allowRemove?: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
  addToPlaylist: [];
  createPlaylist: [];
  remove: [];
}>();

const menuContainer = ref<HTMLElement | null>(null);
const menuButton = ref<HTMLElement | null>(null);
const openUpwards = ref(false);

// Checks available space before opening the menu
watch(() => props.isOpen, async (isOpen) => {
  if (!isOpen) return;

  await nextTick();

  if (!menuButton.value) return;

  const button = menuButton.value.getBoundingClientRect();
  const menuHeight = props.allowRemove ? 230 : 160;

  const spaceBelow = window.innerHeight - button.bottom;
  const spaceAbove = button.top;

  openUpwards.value = spaceBelow < menuHeight && spaceAbove > spaceBelow;
});

// Closes the menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (!props.isOpen) return;

  if (!menuContainer.value?.contains(event.target as Node)) {
    emit("toggle");
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

</script>