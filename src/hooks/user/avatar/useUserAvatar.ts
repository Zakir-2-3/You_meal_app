import { useState, useEffect } from "react";
import { toast } from "react-toastify";

import { store } from "@/store/store";
import { setAvatarUrl } from "@/store/slices/userSlice";

import { DEFAULT_AVATAR } from "@/constants/user/defaults";

import {
  UseUserAvatarProps,
  UseUserAvatarReturn,
} from "@/types/hooks/user-avatar";

export const useUserAvatar = ({
  email,
  avatarUrl,
  dispatch,
  translations,
}: UseUserAvatarProps): UseUserAvatarReturn => {
  const [shouldAnimateAvatar, setShouldAnimateAvatar] = useState(false);

  // Эффект для анимации аватара
  useEffect(() => {
    if (!avatarUrl) return;

    if (avatarUrl.startsWith("blob:")) {
      setShouldAnimateAvatar(true);
      const timer = setTimeout(() => {
        setShouldAnimateAvatar(false);
      }, 300);
      return () => clearTimeout(timer);
    }

    setShouldAnimateAvatar(false);
  }, [avatarUrl]);

  // Функция удаления аватара
  const handleDeleteAvatar = async () => {
    if (avatarUrl === DEFAULT_AVATAR) return;

    const previousAvatarUrl = avatarUrl;

    dispatch(setAvatarUrl(DEFAULT_AVATAR));
    toast.success(translations.avatarDeleted);

    try {
      if (previousAvatarUrl.includes("/avatars/")) {
        const fileName = previousAvatarUrl.split("/avatars/")[1];
        if (fileName) {
          await fetch("/api/avatar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName }),
          });
        }
      }

      const state = store.getState();
      const { email: userEmail, balance } = state.user;
      const cart = state.cart.items;
      const promoCodes = state.promo.activated;

      if (userEmail) {
        await fetch("/api/user/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            cart,
            promoCodes,
            balance,
            avatar: DEFAULT_AVATAR,
          }),
        });
      }
    } catch (error) {
      console.error("Error deleting avatar:", error);
      toast.error(translations.avatarDeleteFailed);
    }
  };

  return {
    shouldAnimateAvatar,
    handleDeleteAvatar,
  };
};
