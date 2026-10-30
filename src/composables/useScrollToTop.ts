import { nextTick, watch } from "vue";
import { useRoute } from "vue-router";

export function useScrollToTop() {
  const route = useRoute();

  // Reset page scroll
  const scrollToTop = async () => {
    await nextTick();

    const mainContent = document.querySelector<HTMLElement>(
      "[data-scroll-container]"
    );

    if (mainContent) {
      mainContent.scrollTop = 0;
    }

    window.scrollTo(0, 0);
  };

  // Reset scroll when the route changes
  watch(
    () => route.fullPath,
    () => {
      void scrollToTop();
    },
    { flush: "post" }
  );

  return {
    scrollToTop,
  };
}