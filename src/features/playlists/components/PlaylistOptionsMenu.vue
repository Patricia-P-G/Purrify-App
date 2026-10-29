<template>
  <!-- Playlist Options Menu -->
  <div ref="menuContainer" class="relative">

    <!-- Playlist Options Button -->
    <button type="button" class="menu-trigger" :class="open ? 'bg-primary-pale text-primary' : ''"
      aria-label="Playlist options" aria-haspopup="menu" :aria-controls="open ? 'playlist-options-menu' : undefined" :aria-expanded="open"
      @click="open = !open">
      <img src="@/assets/icons/dots-icon.svg" alt="" aria-hidden="true" class="h-5 w-5"/>
    </button>

    <!-- Options Menu -->
    <div v-if="open" id="playlist-options-menu" role="menu"
      class="menu-dropdown right-0"
      @keydown.esc="open = false">

      <!-- Edit Playlist -->
      <button type="button" role="menuitem" class="menu-item" @click="handleEdit">
        <span class="menu-icon" aria-hidden="true">
          <img src="@/assets/icons/edit-icon.svg" alt="" class="h-5 w-5"/>
        </span>

        <span>Edit Playlist</span>
      </button>

      <!-- Delete Playlist -->
      <button type="button" role="menuitem" class="menu-item menu-item-danger mt-1" @click="handleDelete">
        <span class="menu-icon" aria-hidden="true">
          <img src="@/assets/icons/trash.svg" alt="" class="h-4 w-4"/>
        </span>

        <span>Delete Playlist</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

const open = ref(false);
const menuContainer = ref<HTMLElement | null>(null);

const emit = defineEmits<{
  edit: [];
  delete: [];
}>();

// Opens Edit Playlist
const handleEdit = () => {
  open.value = false;
  emit("edit");
};

// Opens Delete Playlist
const handleDelete = () => {
  open.value = false;
  emit("delete");
};

// Closes Menu When Clicking Outside
const handleClickOutside = (event: MouseEvent) => {
  if (!menuContainer.value?.contains(event.target as Node)) {
    open.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});

</script>