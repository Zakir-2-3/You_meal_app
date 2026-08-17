import { useState, useCallback, useRef } from "react";

import axios from "axios";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setManyRatings } from "@/store/slices/productMetaSlice";

import { translations } from "@/i18n/translations";

import { Item } from "@/types/product/item";
import { CategoryKey } from "@/types/product/category";
import {
  UIPhase,
  UseProductLoaderReturn,
} from "@/types/hooks/use-product-loader";

export const useProductLoader = (): UseProductLoaderReturn => {
  const [originalItems, setOriginalItems] = useState<Item[]>([]);
  const [baseDisplayedItems, setBaseDisplayedItems] = useState<Item[]>([]);
  const [uiPhase, setUiPhase] = useState<UIPhase>("idle");

  const loadingRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const dispatch = useDispatch<AppDispatch>();

  const { isAuth } = useSelector((state: RootState) => state.user);
  const { ratings, metaSynced } = useSelector(
    (state: RootState) => state.productMeta,
  );

  const updateBaseDisplayedItems = useCallback(
    (updater: (prev: Item[]) => Item[]) => {
      setBaseDisplayedItems(updater);
    },
    [],
  );

  const loadProducts = useCallback(
    async (categoryKey?: CategoryKey, searchValue?: string) => {
      // Если уже загружены товары и это не поиск/фильтрация - пропускаем
      if (hasLoadedRef.current && originalItems.length > 0 && !searchValue) {
        const isSameCategory = !categoryKey;
        if (isSameCategory) {
          return;
        }
      }

      if (loadingRef.current) return;

      // Отменяем предыдущий запрос, если он ещё не завершён
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      loadingRef.current = true;
      setUiPhase("loading");

      try {
        let data: Item[] = [];

        if (searchValue) {
          const res = await axios.get<Item[]>(
            `https://6794c225aad755a134ea56b6.mockapi.io/items?search=${encodeURIComponent(
              searchValue,
            )}`,
            { signal: controller.signal },
          );

          const searchLower = searchValue.toLowerCase().trim();
          data = res.data.filter(
            (item) =>
              item.name_ru.toLowerCase().includes(searchLower) ||
              item.name_en.toLowerCase().includes(searchLower),
          );
        } else if (categoryKey) {
          const categoryParam = `category=${encodeURIComponent(
            translations.ru.categories[categoryKey],
          )}`;
          const res = await axios.get<Item[]>(
            `https://6794c225aad755a134ea56b6.mockapi.io/items?${categoryParam}`,
            { signal: controller.signal },
          );
          data = res.data;
        } else {
          const res = await axios.get<Item[]>(
            `https://6794c225aad755a134ea56b6.mockapi.io/items`,
            { signal: controller.signal },
          );
          data = res.data;
        }

        const prepared = data.map((it) => ({
          ...it,
          instanceId: String(it.id),
        }));

        setOriginalItems(prepared);
        setBaseDisplayedItems(prepared);

        setUiPhase(prepared.length ? "ready" : "empty");
        hasLoadedRef.current = true;

        const patch: Record<string, number> = {};
        for (const it of prepared) {
          if (ratings[it.instanceId!] == null) {
            const newRating = Math.floor(Math.random() * 3) + 3;
            patch[it.instanceId!] = newRating;
          }
        }

        if (Object.keys(patch).length) {
          dispatch(setManyRatings(patch));

          if (isAuth) {
            try {
              const email = (await import("@/store/store")).store.getState()
                .user.email;
              if (email) {
                await fetch("/api/user/sync-ratings", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, ratings: patch }),
                });
              }
            } catch (err) {
              console.error("Failed to sync ratings with DB:", err);
            }
          }
        }
      } catch (e: any) {
        // Игнорируем ошибки отмены – это не настоящая ошибка
        if (e?.name === "AbortError") return;
        console.error("Error loading goods:", e);
        setUiPhase("empty");
        hasLoadedRef.current = true;
      } finally {
        loadingRef.current = false;
        // Очищаем ссылку на контроллер, если он наш
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [dispatch, isAuth, metaSynced, ratings, originalItems.length],
  );

  const resetProducts = useCallback(() => {
    loadingRef.current = false;
    hasLoadedRef.current = false;
    setOriginalItems([]);
    setBaseDisplayedItems([]);
    setUiPhase("idle");
    // Отменяем текущий запрос при сбросе
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    originalItems,
    baseDisplayedItems,
    uiPhase,
    loadProducts,
    resetProducts,
    updateBaseDisplayedItems,
  };
};
