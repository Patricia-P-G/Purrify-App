import { ref } from "vue";

export const useActionError = () => {
  const errorMessage = ref("");
  const isSaving = ref(false);

  const clearError = () => {
    errorMessage.value = "";
  };

  const runAction = async (
    action: () => Promise<boolean>
  ): Promise<boolean> => {
    if (isSaving.value) return false;

    clearError();
    isSaving.value = true;

    try {
      const success = await action();

      if (!success) {
        errorMessage.value = "Unable to save changes. Please try again.";
      }

      return success;
    } catch (error) {
      console.error("Action failed:", error);

      errorMessage.value =
        "Unable to save changes. Please check your internet connection and try again.";

      return false;
    } finally {
      isSaving.value = false;
    }
  };

  return {
    errorMessage,
    isSaving,
    clearError,
    runAction,
  };
};