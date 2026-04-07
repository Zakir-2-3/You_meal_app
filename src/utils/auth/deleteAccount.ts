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

import { DEFAULT_AVATAR } from "@/constants/user/defaults";

import { DeleteAccountTranslations } from "@/types/utils/delete-account";

export const deleteAccount = async (
  dispatch: AppDispatch,
  email: string,
  translations: DeleteAccountTranslations,
) => {
  const {
    accountDeleteFailed,
    accountDeleted,
    accountDeleteError,
    deleteAccountAlert,
  } = translations;

  try {
    const confirmed = window.confirm(deleteAccountAlert);
    if (!confirmed) return;

    // При удаление аккаунта блокируем Google-useEffect
    sessionStorage.setItem("__account_deleting", "true");
    sessionStorage.setItem("__block_autosave", "true");

    // Удаляем пользователя и все его аватарки на сервере
    const res = await fetch("/api/user/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      toast.error(accountDeleteError);
      return;
    }

    // Полностью чистим клиентское состояние
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

    toast.success(accountDeleted);

    // Выходим из NextAuth
    await signOut({ redirect: false });

    // Редирект
    setTimeout(() => {
      window.location.replace("/");
    }, 1500);
  } catch {
    toast.error(accountDeleteFailed);
  } finally {
    sessionStorage.removeItem("__block_autosave");
    sessionStorage.removeItem("__account_deleting");
  }
};
