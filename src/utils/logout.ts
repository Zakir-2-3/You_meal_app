"use client";

import { signOut } from "next-auth/react";

import { toast } from "react-toastify";

import { resetCart } from "@/store/slices/cartSlice";
import { resetPromos } from "@/store/slices/promoSlice";
import { resetMeta } from "@/store/slices/productMetaSlice";
import { resetUser, setGeoCity } from "@/store/slices/userSlice";
import { AppDispatch, RootState, store, persistor } from "@/store/store";

import { detectGeoCity } from "@/utils/geo";

import { DEFAULT_AVATAR, DEFAULT_PROMOS } from "@/constants/defaults";

export const logout = async (
  dispatch: AppDispatch,
  translations: { logoutError: string; logoutSuccess: string },
  onSuccess?: (redirectUrl: string) => void
) => {
  const { logoutError, logoutSuccess } = translations;

  try {
    localStorage.setItem("hasLoggedOut", "true");

    const state: RootState = store.getState();
    const { email, balance, avatarUrl, geoCity } = state.user;
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

    const currentCity = geoCity || localStorage.getItem("city");

    // Приостанавливаем persist перед сбросом redux
    await persistor.pause();

    // Сбрасываем redux состояния
    dispatch(resetCart());
    dispatch(resetPromos());
    dispatch(resetUser());
    dispatch(resetMeta());

    // Убеждаемся, что всё очищено
    await persistor.flush();
    await persistor.purge();

    // Восстанавливаем текущий город
    if (
      currentCity &&
      currentCity !== "geolocation_disabled" &&
      currentCity !== "geolocation_not_supported"
    ) {
      dispatch(setGeoCity(currentCity));
      localStorage.setItem("city", currentCity);
    } else {
      // Если текущий город - ошибка геолокации, пробуем определить заново
      const detectedCity = await detectGeoCity("ru");
      if (
        detectedCity &&
        detectedCity !== "geolocation_disabled" &&
        detectedCity !== "geolocation_not_supported"
      ) {
        dispatch(setGeoCity(detectedCity));
        localStorage.setItem("city", detectedCity);
      } else {
        // Если не удалось определить город, оставляем текущий
        dispatch(setGeoCity(currentCity || ""));
        localStorage.setItem("city", currentCity || "");
      }
    }

    toast.error(logoutSuccess);

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
    toast.error(logoutError);
  }
};
