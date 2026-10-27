import { ref, watch, nextTick, onMounted, onBeforeUnmount, type Ref } from "vue";

// Reusable Infinite Scroll
export function useInfiniteScroll(
  hasMore: Ref<boolean>,
  loadMore: () => Promise<void> | void
) {
  const loadMoreTrigger = ref<HTMLElement | null>(null);
  const isLoadingMore = ref(false);
  const loadingAnnouncement = ref("");

  let observer: IntersectionObserver | null = null;
  let version = 0;

  // Observes the Loading Element
  const observeLoadMore = () => {
    observer?.disconnect();

    if (loadMoreTrigger.value && hasMore.value && !isLoadingMore.value) {
      observer?.observe(loadMoreTrigger.value);
    }
  };

  // Loads More Songs
  const loadNext = async () => {
    if (isLoadingMore.value || !hasMore.value) return;

    const currentVersion = version;

    isLoadingMore.value = true;
    observer?.disconnect();

    try {
      // Shows the Loading Spinner for 1 Second
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (currentVersion !== version) return;

      await loadMore();

      if (currentVersion !== version) return;

      loadingAnnouncement.value = "More songs loaded";
    } catch (error) {
      if (currentVersion === version) {
        console.error("Failed to load more songs:", error);
      }
    } finally {
      if (currentVersion === version) {
        isLoadingMore.value = false;

        await nextTick();
        observeLoadMore();
      }
    }
  };

  // Resets Infinite Scroll
  const reset = () => {
    version++;
    observer?.disconnect();

    isLoadingMore.value = false;
    loadingAnnouncement.value = "";

    void nextTick().then(observeLoadMore);
  };

  // Watches for Changes
  watch(
    [loadMoreTrigger, hasMore],
    async () => {
      await nextTick();
      observeLoadMore();
    },
    { flush: "post" }
  );

  // Initializes Infinite Scroll
  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadNext();
        }
      },
      { rootMargin: "0px" }
    );

    observeLoadMore();
  });

  // Cleans Up
  onBeforeUnmount(() => {
    version++;
    observer?.disconnect();
    observer = null;
  });

  return {
    loadMoreTrigger,
    isLoadingMore,
    loadingAnnouncement,
    reset,
  };
}