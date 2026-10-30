import { computed, ref, watch, type Ref } from "vue";
import type { Track } from "@/types/music";
import { usePlayer, type PlayerSource } from "@/composables/usePlayer";
import { useFavoriteActions } from "@/composables/useFavoritesActions";
import { useActionToast } from "@/composables/useActionToast";
import { useInfiniteScroll } from "@/composables/useInfiniteScroll";

interface TrackListViewOptions {
  // Used in screen reader messages, e.g. "favorite songs"
  label: string;
  // Identifies where the queue came from (also decides which row is highlighted)
  source: () => PlayerSource;
  // Gate for infinite scroll while data is loading or failed
  canLoadMore?: Ref<boolean>;
  // Set to false to show every track without paging
  paginate?: boolean;
  pageSize?: number;
  // Server-side paging (e.g. Spotify playlists); replaces local paging while active
  remote?: {
    active: Ref<boolean>;
    hasMore: Ref<boolean>;
    loadMore: () => Promise<void>;
  };
}

// Shared logic for every page that shows a searchable, playable list of tracks
export function useTrackListView(
  tracks: Ref<Track[]>,
  options: TrackListViewOptions,
) {
  const { label, source: getSource, canLoadMore, remote, paginate = true, pageSize = 10 } = options;

  // Search
  const searchQuery = ref("");

  const filteredTracks = computed(() => {
    const query = searchQuery.value.toLowerCase().trim();

    if (!query) return tracks.value;

    return tracks.value.filter(
      (track) =>
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        track.album?.toLowerCase().includes(query),
    );
  });

  const searchStatus = computed(() => {
    const query = searchQuery.value.trim();

    if (!query) return `${tracks.value.length} ${label} available`;
    if (!filteredTracks.value.length) return `No songs found for ${query}`;

    return `${filteredTracks.value.length} songs found for ${query}`;
  });

  // Local pagination
  const visibleCount = ref(pageSize);

  const usesLocalPaging = computed(() => paginate && !remote?.active.value);

  const visibleTracks = computed(() =>
    usesLocalPaging.value
      ? filteredTracks.value.slice(0, visibleCount.value)
      : filteredTracks.value,
  );

  const hasMore = computed(() => {
    if (!(canLoadMore?.value ?? true)) return false;

    if (remote?.active.value) return remote.hasMore.value;

    return usesLocalPaging.value && visibleCount.value < filteredTracks.value.length;
  });

  const { loadMoreTrigger, isLoadingMore, loadingAnnouncement, reset } = useInfiniteScroll(
    hasMore,
    async () => {
      if (remote?.active.value) {
        await remote.loadMore();
        return;
      }

      visibleCount.value = Math.min(
        visibleCount.value + pageSize,
        filteredTracks.value.length,
      );
    },
  );

  // Track menu
  const openMenu = ref<number | null>(null);

  const toggleMenu = (index: number) => {
    openMenu.value = openMenu.value === index ? null : index;
  };

  // Resets paging and menu (used on new searches and when the data changes)
  const resetList = () => {
    visibleCount.value = pageSize;
    openMenu.value = null;
    reset();
  };

  watch(searchQuery, resetList);

  // Player
  const { currentTrack, currentIndex, isPlaying, playerSource, playTracks, togglePlay } =
    usePlayer();

  const isFromThisList = computed(() => {
    const source = getSource();

    return (
      playerSource.value?.type === source.type &&
      (source.id === undefined || playerSource.value.id === source.id)
    );
  });

  // Only highlight the playing row when it was started from this list
  const activeTrackId = computed(() =>
    isFromThisList.value ? currentTrack.value?.id : undefined,
  );
  const activeTrackIndex = computed(() => (isFromThisList.value ? currentIndex.value : -1));

  const playbackMessage = ref("");

  const runPlayback = async (action: () => Promise<void>, failMessage: string) => {
    playbackMessage.value = "";

    try {
      await action();
    } catch (error) {
      console.error(failMessage, error);
      playbackMessage.value = failMessage;
    }
  };

  const handleTrackClick = (track: Track, index: number) => {
    const isCurrent =
      isFromThisList.value &&
      currentTrack.value?.id === track.id &&
      currentIndex.value === index;

    return runPlayback(
      () => (isCurrent ? togglePlay() : playTracks(filteredTracks.value, index, getSource())),
      "Unable to play this song. Please try again.",
    );
  };

  const playAll = () => {
    if (!filteredTracks.value.length) return Promise.resolve();

    return runPlayback(
      () => playTracks(filteredTracks.value, 0, getSource()),
      "Unable to start playback. Please try again.",
    );
  };

  // Favorites and toast feedback
  const { isFavorite, handleFavoriteClick } = useFavoriteActions();
  const toast = useActionToast();

  return {
    // Search
    searchQuery,
    searchStatus,
    filteredTracks,
    // Paging
    visibleTracks,
    hasMore,
    loadMoreTrigger,
    isLoadingMore,
    loadingAnnouncement,
    resetList,
    // Menu
    openMenu,
    toggleMenu,
    // Player
    isPlaying,
    activeTrackId,
    activeTrackIndex,
    playbackMessage,
    handleTrackClick,
    playAll,
    // Favorites and toast
    isFavorite,
    handleFavoriteClick,
    ...toast,
  };
}