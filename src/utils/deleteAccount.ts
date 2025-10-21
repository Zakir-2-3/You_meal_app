import { signOut } from "next-auth/react";

import { toast } from "react-toastify";

import { persistor, AppDispatch } from "@/store/store";
import { resetCart } from "@/store/slices/cartSlice";
import { resetPromos } from "@/store/slices/promoSlice";
import {
  setAuthStatus,
  setEmail,
  setName,
  setAvatarUrl,
} from "@/store/slices/userSlice";

import { useTranslate } from "@/hooks/useTranslate";

import { supabase } from "@/lib/supabaseClient";

import { DEFAULT_AVATAR } from "@/constants/defaults";

export const deleteAccount = async (
  dispatch: AppDispatch,
  email: string,
  avatarUrl?: string
) => {
  const { t } = useTranslate();

  const { accountDeleteFailed, accountDeleted, accountDeleteError } = t.toastTr;

  try {
    const confirmed = window.confirm("Вы точно хотите удалить аккаунт?");
    if (!confirmed) return;

    // Удаление аватарки
    if (avatarUrl && !avatarUrl.includes("default-user-avatar")) {
      const fileName = avatarUrl.split("/avatars/")[1];
      if (fileName) {
        await fetch("/api/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName }),
        });
        console.log("Аватарка удалена из Supabase Storage");
      }
    }

    // Удаление из Supabase
    const { error } = await supabase.from("users").delete().eq("email", email);
    if (error) {
      console.error("Ошибка при удалении пользователя:", error.message);
      toast.error(accountDeleteError);
      return;
    }

    // Очистка Redux
    dispatch(resetCart());
    dispatch(resetPromos());
    dispatch(setAuthStatus(false));
    dispatch(setEmail(""));
    dispatch(setName(""));
    dispatch(setAvatarUrl(DEFAULT_AVATAR));

    await persistor.pause();
    await persistor.flush();
    await persistor.purge();
    localStorage.removeItem("persist:root");

    toast.error(accountDeleted);

    // Сбрасывает JWT токен
    await signOut({ redirect: false });
    // Редирект
    setTimeout(() => {
      window.location.replace("/");
    }, 1500);
  } catch (err) {
    console.error("Ошибка удаления аккаунта:", err);
    toast.error(accountDeleteFailed);
  }
};
