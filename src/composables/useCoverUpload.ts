import { computed, onBeforeUnmount, ref } from "vue";
import { deleteCover, MAX_COVER_SIZE, uploadCover } from "@/services/appwrite/storage";

// Handles choosing, previewing and uploading a playlist cover
export function useCoverUpload(initialUrl: string | null = null) {
  const preview = ref<string | null>(initialUrl);
  const file = ref<File | null>(null);
  const error = ref("");

  let objectUrl: string | null = null;
  let uploadedUrl: string | null = null;

  const revokePreview = () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  };

  // Validates the chosen image and shows a preview
  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const chosen = input.files?.[0];

    input.value = "";
    error.value = "";

    if (!chosen) return;

    if (!chosen.type.startsWith("image/")) {
      error.value = "Please choose an image file.";
      return;
    }

    if (chosen.size > MAX_COVER_SIZE) {
      error.value = "The image is too large. Choose one under 2 MB.";
      return;
    }

    revokePreview();
    objectUrl = URL.createObjectURL(chosen);
    file.value = chosen;
    preview.value = objectUrl;
  };

  const remove = () => {
    revokePreview();
    file.value = null;
    preview.value = null;
    error.value = "";
  };

  // True when the cover is different from the one the form started with
  const hasChanged = computed(() => file.value !== null || preview.value !== initialUrl);

  // Uploads a newly chosen image (if any) and returns the URL to save
  const resolveUrl = async (): Promise<string | null> => {
    if (!file.value) return preview.value;

    uploadedUrl = await uploadCover(file.value);
    return uploadedUrl;
  };

  // Removes an uploaded image when saving the playlist afterwards failed
  const discardUpload = async () => {
    await deleteCover(uploadedUrl);
    uploadedUrl = null;
  };

  onBeforeUnmount(revokePreview);

  return {
    preview,
    error,
    hasChanged,
    handleFileChange,
    remove,
    resolveUrl,
    discardUpload,
  };
}