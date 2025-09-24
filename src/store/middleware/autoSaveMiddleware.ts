import type { Middleware, Dispatch, Action } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { AUTO_SAVE_ACTIONS } from "@/constants/autoSaveActions";
import { DEFAULT_PROMOS } from "@/constants/defaults";
import { syncUserData } from "@/utils/syncUserData";

let debounceTimer: ReturnType<typeof setTimeout>;

// Список действий, которые не должны триггерить автосохранение
const IGNORED_ACTIONS = [
  "productMeta/hydrateMeta",
  "productMeta/resetMeta",
  "persist/REHYDRATE",
  "user/setAuthStatus",
];

export const autoSaveMiddleware: Middleware<
  Dispatch<Action<string>>,
  RootState
> = (store) => (next) => (action) => {
  const result = next(action);

  // Проверяем, нужно ли игнорировать это действие
  const shouldIgnoreAction =
    typeof action === "object" &&
    action !== null &&
    "type" in action &&
    typeof action.type === "string" &&
    IGNORED_ACTIONS.includes(action.type);

  if (shouldIgnoreAction) {
    return result;
  }

  const shouldAutoSave =
    typeof action === "object" &&
    action !== null &&
    "type" in action &&
    typeof action.type === "string" &&
    AUTO_SAVE_ACTIONS.includes(action.type);

  if (shouldAutoSave) {
    const state = store.getState();
    const { isAuth, email, balance, avatarUrl, geoCity } = state.user;
    const cart = state.cart.items;
    const promoActivated = state.promo.activated;
    const promoAvailable = state.promo.available;
    const { ratings, favorites, metaSynced } = state.productMeta;

    // Сохраняем только если пользователь авторизован и метаданные уже синхронизированы с сервером
    if (!isAuth || !email || !metaSynced) {
      return result;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        // Создаем объект с данными для сохранения
        const updateData: any = {
          type: "save" as const,
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
          ratings,
          favorites,
        };

        // Добавляем city только если он есть
        if (geoCity) {
          updateData.city = geoCity;
        }

        // Используем функцию syncUserData вместо прямого fetch
        await syncUserData(updateData);
        console.log("Автосохранение выполнено");
      } catch (err) {
        console.error("Ошибка автосохранения:", err);
      }
    }, 1000);
  }

  return result;
};
