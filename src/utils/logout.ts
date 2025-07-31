"use client";

import { signOut } from "next-auth/react";

import { toast } from "react-toastify";

import { AppDispatch, RootState, store, persistor } from "@/store/store";
import { resetCart } from "@/store/slices/cartSlice";
import { resetPromos } from "@/store/slices/promoSlice";
import { resetUser } from "@/store/slices/userSlice";

import { DEFAULT_AVATAR, DEFAULT_PROMOS } from "@/constants/defaults";

export const logout = async (
  dispatch: AppDispatch,
  onSuccess?: (redirectUrl: string) => void
) => {
  try {
    localStorage.setItem("hasLoggedOut", "true");

    const state: RootState = store.getState();
    const { email, balance, avatarUrl } = state.user;
    const { items: cart } = state.cart;
    const { activated, available } = state.promo;

    // Сохраняем пользовательские данные
    if (email) {
      await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          cart,
          balance,
          promoCodes: {
            activated,
            available: [
              ...new Set([
                ...available,
                ...DEFAULT_PROMOS.filter((code) => !activated.includes(code)),
              ]),
            ],
          },
          avatar: avatarUrl || DEFAULT_AVATAR,
        }),
      });
    }

    // Приостанавливаем persist перед сбросом redux
    await persistor.pause();

    dispatch(resetCart());
    dispatch(resetPromos());
    dispatch(resetUser());

    // Убеждаемся, что всё очищено
    await persistor.flush();
    await persistor.purge();

    toast.error("Вы вышли из аккаунта");

    const signOutOptions = {
      callbackUrl: "/",
      redirect: typeof onSuccess !== "function",
    };

    await signOut(signOutOptions);

    if (typeof onSuccess === "function") {
      onSuccess("/");
    }

    setTimeout(() => {
      window.location.href = "/";
    }, 100);
  } catch (error) {
    console.error("Logout error:", error);
    toast.error("Произошла ошибка при выходе из аккаунта");
  }
};
