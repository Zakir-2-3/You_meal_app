import { useCallback } from "react";

import { useDispatch } from "react-redux";
import { AppDispatch, RootState, store } from "@/store/store";
import { setItems } from "@/store/slices/cartSlice";
import { setPromoCodes } from "@/store/slices/promoSlice";
import {
  setBalance,
  setGeoCity,
  setAuthStatus,
  setEmail,
  setName,
  setAvatarUrl,
} from "@/store/slices/userSlice";

import { useTranslate } from "@/hooks/app/useTranslate";

import { DEFAULT_AVATAR } from "@/constants/user/defaults";

export const useUserDataLoader = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslate();

  const loadUserData = useCallback(
    async (email: string) => {
      try {
        // Запрос данных пользователя
        const res = await fetch("/api/user/load", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (!res.ok) {
          console.error("Request Error", await res.text());
          return;
        }

        const data = await res.json();

        // Проверка, найден ли пользователь
        if (!data || !data.email) {
          console.warn("User not found while loading data");

          if (
            typeof window !== "undefined" &&
            sessionStorage.getItem("__block_autosave") === "true"
          ) {
            console.log("Skipping data download (deleting account)");
            return;
          }

          dispatch(setAuthStatus(false));
          dispatch(setEmail(""));
          dispatch(setAvatarUrl(DEFAULT_AVATAR));
          return;
        }

        // Синхронизация корзины
        await syncCart(email, data.cart);

        // Синхронизация города - передаем t.geo
        await syncCity(email, data.city, t.geo);

        // Обновление остальных данных
        updateUserData(data);
      } catch (err) {
        console.error("Error loading user data:", err);
      }
    },
    [dispatch, t],
  );

  const syncCart = async (email: string, dbCart: any[]) => {
    const savedCart = JSON.parse(
      sessionStorage.getItem("googleAuthCart") || "[]",
    );
    const localCart =
      savedCart.length > 0
        ? savedCart
        : (store.getState() as RootState).cart.items;

    if (savedCart.length > 0) {
      sessionStorage.removeItem("googleAuthCart");
    }

    if (!dbCart || dbCart.length === 0) {
      if (localCart.length > 0) {
        await fetch("/api/user/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            cart: localCart,
          }),
        });
        dispatch(setItems(localCart));
      }
    } else {
      dispatch(setItems(dbCart));
    }
  };

  const syncCity = async (
    email: string,
    dbCity: string,
    geoRules: { disabledGeo: string; notSupportedGeo: string },
  ) => {
    const localCity =
      (store.getState() as RootState).user.geoCity ||
      localStorage.getItem("city");

    const isBadCity = (city: string | null): boolean => {
      if (!city) return true;
      return (
        city === "geolocation_disabled" ||
        city === "geolocation_not_supported" ||
        city === geoRules.disabledGeo ||
        city === geoRules.notSupportedGeo ||
        city === "Геолокация отключена" ||
        city === "Geolocation disabled"
      );
    };

    const isGoodCity = (city: string | null): boolean => {
      return !!city && !isBadCity(city);
    };

    let finalCity = dbCity;

    if (isBadCity(dbCity) && isGoodCity(localCity)) {
      finalCity = localCity!;
      await updateCityInDb(email, localCity!);
    } else if (!dbCity && isGoodCity(localCity)) {
      finalCity = localCity!;
      await updateCityInDb(email, localCity!);
    } else if (isGoodCity(dbCity)) {
      finalCity = dbCity;
    } else {
      finalCity = dbCity || localCity || "";
    }

    if (finalCity) {
      dispatch(setGeoCity(finalCity));
      localStorage.setItem("city", finalCity);
    }
  };

  const updateCityInDb = async (email: string, city: string) => {
    await fetch("/api/user/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, city }),
    });
  };

  const updateUserData = (data: any) => {
    const currentPromoCodes = {
      activated: store.getState().promo.activated ?? [],
      customAvailable: store.getState().promo.customAvailable ?? [],
    };

    let newPromoCodes: { activated: string[]; customAvailable: string[] };

    if (data.promoCodes && typeof data.promoCodes === "object") {
      newPromoCodes = {
        activated: Array.isArray(data.promoCodes.activated)
          ? data.promoCodes.activated
          : [],
        customAvailable: Array.isArray(data.promoCodes.customAvailable)
          ? data.promoCodes.customAvailable
          : [],
      };
    } else if (
      currentPromoCodes.activated.length > 0 ||
      currentPromoCodes.customAvailable.length > 0
    ) {
      newPromoCodes = {
        activated: currentPromoCodes.activated,
        customAvailable: currentPromoCodes.customAvailable,
      };
    } else {
      newPromoCodes = { activated: [], customAvailable: [] };
    }

    if (typeof data.name === "string" && data.name.trim()) {
      dispatch(setName(data.name));
    }
    dispatch(setPromoCodes(newPromoCodes));
    dispatch(setBalance(data.balance || 0));
    dispatch(setAvatarUrl(data.avatar || DEFAULT_AVATAR));
  };

  return { loadUserData };
};
