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

  const dispatch = useDispatch<AppDispatch>();
  const { isAuth } = useSelector((s: RootState) => s.user);
  const { ratings, metaSynced } = useSelector((s: RootState) => s.productMeta);

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
        // Только если это точно такая же категория (или все товары)
        const isSameCategory = !categoryKey;
        if (isSameCategory) {
          return;
        }
      }

      // Запрещаем повторную загрузку
      if (loadingRef.current) return;

      loadingRef.current = true;

      // Только если реально нет товаров - показываем loading
      if (originalItems.length === 0 && !hasLoadedRef.current) {
        setUiPhase("loading");
      }

      try {
        let data: Item[] = [];

        if (searchValue) {
          const res = await axios.get<Item[]>(
            `https://6794c225aad755a134ea56b6.mockapi.io/items?search=${encodeURIComponent(
              searchValue,
            )}`,
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
          );
          data = res.data;
        } else {
          const res = await axios.get<Item[]>(
            `https://6794c225aad755a134ea56b6.mockapi.io/items`,
          );
          data = res.data;
        }

        const prepared = data.map((it) => ({
          ...it,
          instanceId: String(it.id),
        }));

        setOriginalItems(prepared);
        setBaseDisplayedItems(prepared);

        // Всегда устанавливаем ready, если есть данные, даже если уже были загружены
        setUiPhase(prepared.length ? "ready" : "empty");
        hasLoadedRef.current = true;

        const patch: Record<string, number> = {};
        for (const it of prepared) {
          if (ratings[it.instanceId!] == null) {
            // Всегда генерируем, если рейтинга нет в Redux
            const newRating = Math.floor(Math.random() * 3) + 3;
            patch[it.instanceId!] = newRating;
          }
        }

        if (Object.keys(patch).length) {
          dispatch(setManyRatings(patch));

          // Синхронизация новых рейтингов с БД для авторизованных пользователей
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
      } catch (e) {
        console.error("Error loading goods:", e);
        setUiPhase("empty");
        hasLoadedRef.current = true;
      } finally {
        loadingRef.current = false;
      }
    },
    [dispatch, isAuth, metaSynced, ratings, originalItems],
  );

  const resetProducts = useCallback(() => {
    loadingRef.current = false;
    hasLoadedRef.current = false;
    setOriginalItems([]);
    setBaseDisplayedItems([]);
    setUiPhase("idle");
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
