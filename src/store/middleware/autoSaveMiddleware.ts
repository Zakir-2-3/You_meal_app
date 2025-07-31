import type { Middleware, Dispatch, Action } from "@reduxjs/toolkit";
import { RootState } from "../store";

import { AUTO_SAVE_ACTIONS } from "@/constants/autoSaveActions";
import { DEFAULT_PROMOS } from "@/constants/defaults";

let debounceTimer: ReturnType<typeof setTimeout>;

export const autoSaveMiddleware: Middleware<
  Dispatch<Action<string>>,
  RootState
> = (store) => (next) => (action) => {
  const result = next(action);

  // Проверка типа действия
  if (
    typeof action === "object" &&
    action !== null &&
    "type" in action &&
    typeof action.type === "string" &&
    AUTO_SAVE_ACTIONS.includes(action.type)
  ) {
    const state = store.getState();
    const { isAuth, email, balance, avatarUrl } = state.user;
    const cart = state.cart.items;
    const promoActivated = state.promo.activated;
    const promoAvailable = state.promo.available;

    if (!isAuth || !email) return result;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        await fetch("/api/user/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            cart,
            balance,
            image: avatarUrl,
            promoCodes: {
              activated: promoActivated,
              available: [
                ...new Set([
                  ...promoAvailable,
                  ...DEFAULT_PROMOS.filter(
                    (code) => !promoActivated.includes(code)
                  ),
                ]),
              ],
            },
          }),
        });
        console.log("Автосохранение выполнено");
      } catch (err) {
        console.error("Ошибка автосохранения:", err);
      }
    }, 1500);
  }

  return result;
};
