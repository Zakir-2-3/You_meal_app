import { useImageCrop } from "./useImageCrop";
import { useTranslate } from "@/hooks/app/useTranslate";
import { useSupabaseUpload } from "./useSupabaseUpload";
import { useDropzoneHandler } from "./useDropzoneHandler";

import { UseAvatarUploadProps } from "@/types/hooks/avatar-upload";

export const useAvatarUpload = ({ email, onClose }: UseAvatarUploadProps) => {
  const { t } = useTranslate();
  const crop = useImageCrop();
  const upload = useSupabaseUpload({ email, onClose });
  const dropzone = useDropzoneHandler();

  const showCroppedImage = () => {
    // Проверяем всё
    if (!dropzone.imageSrc || !crop.croppedAreaPixels || !email) {
      console.error("Missing data for avatar upload");
      return;
    }

    upload.uploadAvatar(dropzone.imageSrc, crop.croppedAreaPixels, {
      avatarAdded: t.toastTr.avatarAdded,
      avatarUpdated: t.toastTr.avatarUpdated,
      avatarSaveFailed: t.toastTr.avatarSaveFailed,
    });
  };

  return {
    ...crop,
    ...dropzone,
    showCroppedImage,
  };
};
