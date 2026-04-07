import type { Middleware, Dispatch, Action } from "@reduxjs/toolkit";
import { RootState } from "../store/store";

import { syncUserData } from "@/utils/user/syncUserData";

import { IGNORED_ACTIONS } from "@/constants/app/ignoredActions";
import { AUTO_SAVE_ACTIONS } from "@/constants/app/autoSaveActions";

let debounceTimer: ReturnType<typeof setTimeout>;

const isBlobUrl = (url: string): boolean => url.startsWith("blob:");

export const autoSaveMiddleware: Middleware<
  Dispatch<Action<string>>,
  RootState
> = (store) => (next) => (action) => {
  const result = next(action);

  if (typeof window !== "undefined") {
    if (
      sessionStorage.getItem("__block_autosave") === "true" ||
      sessionStorage.getItem("__sign_out_in_progress") === "true"
    ) {
      return result;
    }
  }

  if (
    typeof action === "object" &&
    action &&
    "type" in action &&
    IGNORED_ACTIONS.includes(action.type as string)
  ) {
    return result;
  }

  if (
    typeof action !== "object" ||
    !action ||
    !("type" in action) ||
    !AUTO_SAVE_ACTIONS.includes(action.type as string)
  ) {
    return result;
  }

  const state = store.getState();
  const { isAuth, email, balance, avatarUrl, geoCity } = state.user;
  const cart = state.cart.items;
  const promoActivated = state.promo.activated;
  const promoAvailable = state.promo.customAvailable;
  const { ratings, favorites, metaSynced } = state.productMeta;

  if (!isAuth || !email || !metaSynced) {
    return result;
  }

  if (avatarUrl && isBlobUrl(avatarUrl)) {
    return result;
  }

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    try {
      await syncUserData({
        type: "save",
        email,
        cart,
        balance,
        avatar: avatarUrl,
        promoCodes: {
          activated: promoActivated,
          customAvailable: promoAvailable,
        },
        ratings,
        favorites,
        city: geoCity || undefined,
      });
    } catch {}
  }, 1000);

  return result;
};
