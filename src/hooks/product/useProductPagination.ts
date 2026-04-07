import { useCallback, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setManyRatings } from "@/store/slices/productMetaSlice";

import { insertSorted } from "@/utils/cart/insertSorted";

import { UIItem } from "@/types/utils/insert-sorted";
import { Item } from "@/types/product/item";
import {
  UseProductPaginationProps,
  UseProductPaginationReturn,
} from "@/types/hooks/use-product-pagination";

export const useProductPagination = ({
  originalItems,
  baseDisplayedItems,
  updateBaseDisplayedItems,
  displayedItems,
  setDisplayedItems,
}: UseProductPaginationProps): UseProductPaginationReturn => {
  const LOAD_MORE_COUNT = 6;

  const dispatch = useDispatch<AppDispatch>();
  const { isAuth } = useSelector((s: RootState) => s.user);
  const { ratings, favorites, sort } = useSelector(
    (s: RootState) => s.productMeta,
  );
  const metaSynced = useSelector((s: RootState) => s.productMeta.metaSynced);

  const pageCountRef = useRef(1);
  const isLoadMoreRef = useRef(false);
  const [noMorePulse, setNoMorePulse] = useState(false);

  // Функция для создания стабильного instanceId для копии
  const generateCopyInstanceId = useCallback(
    (originalId: number | string, copyNumber: number): string => {
      return `${originalId}-copy-${copyNumber}`;
    },
    [],
  );

  // Функция создания копий с стабильными ID
  const makeStableCopies = useCallback(
    (originals: Item[], count: number): Item[] => {
      const copies: Item[] = [];

      for (let i = 0; i < count; i++) {
        const original = originals[i % originals.length];
        const originalId = original.id;

        // Определяем, сколько копий этого товара уже было создано
        const existingCopies = baseDisplayedItems.filter(
          (item) =>
            item.instanceId !== String(originalId) &&
            item.instanceId?.startsWith(`${originalId}-copy-`),
        ).length;

        // Номер следующей копии этого товара
        const copyNumber = existingCopies + 1;
        const instanceId = generateCopyInstanceId(originalId, copyNumber);

        copies.push({
          ...original,
          instanceId: instanceId,
        });
      }
      return copies;
    },
    [baseDisplayedItems, generateCopyInstanceId],
  );

  // Вспомогательная функция для обновления displayedItems с очисткой _justAdded
  const updateDisplayedWithCleanup = useCallback(
    (newItems: UIItem[]) => {
      setDisplayedItems((prev) => [...prev, ...newItems]);

      setTimeout(() => {
        setDisplayedItems((curr) =>
          curr.map((i) => ({ ...i, _justAdded: false })),
        );
        isLoadMoreRef.current = false;
      }, 450);
    },
    [setDisplayedItems],
  );

  // Логика загрузки для избранного
  const loadMoreFavorites = useCallback((): boolean => {
    const favs = baseDisplayedItems.filter((it) =>
      favorites.includes(it.instanceId!),
    );

    if (displayedItems.length < favs.length) {
      const nextCount = Math.min(
        displayedItems.length + LOAD_MORE_COUNT,
        favs.length,
      );
      const nextSlice = favs
        .slice(displayedItems.length, nextCount)
        .map((it, idx) => ({
          ...it,
          _justAdded: true,
          _animationDelay: `${idx * 0.1}s`,
        }));

      updateDisplayedWithCleanup(nextSlice);
      return true;
    }

    setNoMorePulse(true);
    setTimeout(() => setNoMorePulse(false), 350);
    isLoadMoreRef.current = false;
    return false;
  }, [
    baseDisplayedItems,
    favorites,
    displayedItems,
    updateDisplayedWithCleanup,
  ]);

  // Логика загрузки для сортировки по умолчанию
  const loadMoreDefault = useCallback(
    (newCopies: Item[]) => {
      const newItems = newCopies.map((it, idx) => ({
        ...it,
        _justAdded: true,
        _animationDelay: `${idx * 0.1}s`,
      }));

      updateDisplayedWithCleanup(newItems);
    },
    [updateDisplayedWithCleanup],
  );

  // Логика загрузки для сортировки по цене/рейтингу
  const loadMoreSorted = useCallback(
    (newCopies: Item[], patch: Record<string, number>) => {
      setDisplayedItems((prev) => {
        const updated = insertSorted(
          prev,
          newCopies,
          { by: sort.by, dir: sort.dir },
          { ...ratings, ...patch },
          favorites,
        );

        setTimeout(() => {
          setDisplayedItems((curr) =>
            curr.map((i) => ({ ...i, _justAdded: false })),
          );
          isLoadMoreRef.current = false;
        }, 400);

        return updated;
      });
    },
    [sort.by, sort.dir, ratings, favorites, setDisplayedItems],
  );

  // Основная функция загрузки
  const handleLoadMore = useCallback(async () => {
    if (isLoadMoreRef.current) return;
    isLoadMoreRef.current = true;

    // Обработка избранного
    if (sort.by === "favorites") {
      loadMoreFavorites();
      return;
    }

    // Создаем новые копии
    const nextPage = pageCountRef.current + 1;
    const newCopies = makeStableCopies(originalItems, LOAD_MORE_COUNT);

    // Обновляем рейтинги для новых копий
    const patch: Record<string, number> = {};
    for (const copy of newCopies) {
      if (ratings[copy.instanceId!] == null) {
        const newRating = Math.floor(Math.random() * 3) + 3;
        patch[copy.instanceId!] = newRating;
      }
    }

    if (Object.keys(patch).length) {
      dispatch(setManyRatings(patch));

      // Синхронизация с БД для авторизованных пользователей
      if (isAuth) {
        try {
          const email = (await import("@/store/store")).store.getState().user
            .email;
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

    // Добавляем новые копии в базовый список
    updateBaseDisplayedItems((prev) => [...prev, ...newCopies]);
    pageCountRef.current = nextPage;

    // Выбираем стратегию отображения
    if (sort.by === "default") {
      loadMoreDefault(newCopies);
      return;
    }

    if (sort.by === "price" || sort.by === "rating") {
      loadMoreSorted(newCopies, patch);
      return;
    }

    // Fallback
    loadMoreDefault(newCopies);
  }, [
    sort.by,
    originalItems,
    ratings,
    isAuth,
    metaSynced,
    dispatch,
    updateBaseDisplayedItems,
    makeStableCopies,
    loadMoreFavorites,
    loadMoreDefault,
    loadMoreSorted,
  ]);

  // Сброс пагинации
  const resetPagination = useCallback(() => {
    pageCountRef.current = 1;
    isLoadMoreRef.current = false;
  }, []);

  return {
    handleLoadMore,
    resetPagination,
    noMorePulse,
    setNoMorePulse,
  };
};
