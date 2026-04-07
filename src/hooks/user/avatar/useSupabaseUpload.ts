import { useCallback } from "react";
import { toast } from "react-toastify";

import { useDispatch } from "react-redux";
import { AppDispatch, store } from "@/store/store";
import { setAvatarUrl } from "@/store/slices/userSlice";

import { getCroppedImg } from "@/utils/common/cropImage";

import { supabase } from "@/lib/supabase/supabaseClient";

import { DEFAULT_AVATAR } from "@/constants/user/defaults";

import {
  AvatarUploadTranslations,
  UseAvatarUploadProps,
} from "@/types/hooks/avatar-upload";

export const useSupabaseUpload = ({ email, onClose }: UseAvatarUploadProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const uploadAvatar = useCallback(
    async (
      imageSrc: string,
      croppedAreaPixels: any,
      translations: AvatarUploadTranslations,
    ) => {
      let tempUrl: string | null = null;
      let previousAvatarUrl: string | null = null;

      try {
        if (!imageSrc || !croppedAreaPixels) return;
        if (!email) throw new Error("User email not found");

        previousAvatarUrl = store.getState().user.avatarUrl;
        const isDefaultBefore = previousAvatarUrl === DEFAULT_AVATAR;

        onClose();

        // Создаем blob для мгновенного отображения
        const croppedBlob = (await getCroppedImg(
          imageSrc,
          croppedAreaPixels,
          "blob",
        )) as Blob;

        // Показываем blob сразу
        tempUrl = URL.createObjectURL(croppedBlob);
        dispatch(setAvatarUrl(tempUrl));
        toast.success(
          isDefaultBefore
            ? translations.avatarAdded
            : translations.avatarUpdated,
        );

        const fileName = `${email}_${Date.now()}.jpg`;

        // Загружаем на Supabase
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, croppedBlob, {
            cacheControl: "3600",
            upsert: true,
            contentType: "image/jpeg",
          });

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(fileName);

        // Заменяем blob на постоянный URL
        dispatch(setAvatarUrl(publicUrl));

        // Очищаем blob
        if (tempUrl) {
          URL.revokeObjectURL(tempUrl);
          tempUrl = null;
        }

        // Сохраняем в базу
        const state = store.getState();
        await fetch("/api/user/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            avatar: publicUrl,
            cart: state.cart.items,
            promoCodes: {
              activated: state.promo.activated,
              customAvailable: state.promo.customAvailable,
            },
            balance: state.user.balance,
          }),
        });
      } catch (e) {
        toast.error(translations.avatarSaveFailed);

        // В случае ошибки возвращаем старую аватарку
        if (previousAvatarUrl) {
          dispatch(setAvatarUrl(previousAvatarUrl));
        }

        // Очищаем blob, если он был создан
        if (tempUrl) {
          URL.revokeObjectURL(tempUrl);
        }
      }
    },
    [email, dispatch, onClose],
  );

  return { uploadAvatar };
};
