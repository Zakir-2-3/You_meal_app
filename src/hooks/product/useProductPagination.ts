import { useCallback, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setManyRatings } from "@/store/slices/productMetaSlice";

import { sortItemsWithAnimation } from "@/utils/cart/insertSorted";

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

  const { isAuth } = useSelector((state: RootState) => state.user);
  const { ratings, favorites, sort } = useSelector(
    (state: RootState) => state.productMeta,
  );

  const pageCountRef = useRef(1);
  const isLoadMoreRef = useRef(false);
  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [noMorePulse, setNoMorePulse] = useState(false);

  const clearTimers = () => {
    if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);
    if (blockTimerRef.current) clearTimeout(blockTimerRef.current);
  };

  const scheduleCleanup = (callback: () => void, delay = 600) => {
    if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);
    cleanupTimerRef.current = setTimeout(() => {
      callback();
      cleanupTimerRef.current = null;
    }, delay);
  };

  const scheduleUnblock = (delay = 400) => {
    if (blockTimerRef.current) clearTimeout(blockTimerRef.current);
    blockTimerRef.current = setTimeout(() => {
      isLoadMoreRef.current = false;
      blockTimerRef.current = null;
    }, delay);
  };

  const generateCopyInstanceId = useCallback(
    (originalId: number | string, copyNumber: number): string => {
      return `${originalId}-copy-${copyNumber}`;
    },
    [],
  );

  const makeStableCopies = useCallback(
    (originals: Item[], count: number): Item[] => {
      const copies: Item[] = [];
      for (let i = 0; i < count; i++) {
        const original = originals[i % originals.length];
        const originalId = original.id;
        const existingCopies = baseDisplayedItems.filter(
          (item) =>
            item.instanceId !== String(originalId) &&
            item.instanceId?.startsWith(`${originalId}-copy-`),
        ).length;
        const copyNumber = existingCopies + 1;
        const instanceId = generateCopyInstanceId(originalId, copyNumber);
        copies.push({ ...original, instanceId: instanceId });
      }
      return copies;
    },
    [baseDisplayedItems, generateCopyInstanceId],
  );

  const updateDisplayedWithCleanup = useCallback(
    (newItems: Item[]) => {
      const animatedNewItems = newItems.map((item, idx) => ({
        ...item,
        _justAdded: true,
        _animationDelay: `${idx * 0.2}s`,
      }));
      setDisplayedItems((prev) => [...prev, ...animatedNewItems]);

      scheduleCleanup(() => {
        setDisplayedItems((curr) =>
          curr.map((i) => ({ ...i, _justAdded: false })),
        );
      }, 600);
      scheduleUnblock(400);
    },
    [setDisplayedItems, scheduleCleanup, scheduleUnblock],
  );

  const loadMoreFavorites = useCallback((): boolean => {
    const favSet = new Set(favorites);
    const allFavItems = originalItems
      .filter((it) => favSet.has(String(it.id)))
      .map((it) => ({ ...it, instanceId: String(it.id) }));

    for (const iid of favSet) {
      if (!allFavItems.some((it) => it.instanceId === iid)) {
        const originalId = iid.includes("-copy-")
          ? iid.split("-copy-")[0]
          : iid;
        const original = originalItems.find(
          (it) => String(it.id) === originalId,
        );
        if (original) {
          allFavItems.push({ ...original, instanceId: iid });
        }
      }
    }

    if (allFavItems.length === 0) {
      setNoMorePulse(true);
      scheduleCleanup(() => setNoMorePulse(false), 350);
      isLoadMoreRef.current = false;
      return false;
    }

    if (displayedItems.length < allFavItems.length) {
      // Очищаем текущие товары
      setDisplayedItems([]);

      // Через 50 мс показываем все избранные с анимацией
      scheduleCleanup(() => {
        const animated = allFavItems.map((item, idx) => ({
          ...item,
          _justAdded: true,
          _animationDelay: `${idx * 0.1}s`,
        }));
        setDisplayedItems(animated);

        // Сброс флага _justAdded через 600 мс
        scheduleCleanup(() => {
          setDisplayedItems((curr) =>
            curr.map((i) => ({ ...i, _justAdded: false })),
          );
        }, 600);
        scheduleUnblock(400);
      }, 50);

      return true;
    }

    setNoMorePulse(true);
    scheduleCleanup(() => setNoMorePulse(false), 350);
    isLoadMoreRef.current = false;
    return false;
  }, [
    originalItems,
    favorites,
    displayedItems,
    setDisplayedItems,
    scheduleCleanup,
    scheduleUnblock,
  ]);

  const loadMoreDefault = useCallback(
    (newCopies: Item[]) => {
      updateDisplayedWithCleanup(newCopies);
    },
    [updateDisplayedWithCleanup],
  );

  const loadMoreSorted = useCallback(
    (newCopies: Item[], patch: Record<string, number>) => {
      const allItems = [...baseDisplayedItems, ...newCopies];
      const sorted = sortItemsWithAnimation(
        allItems,
        { by: sort.by, dir: sort.dir },
        { ...ratings, ...patch },
        favorites,
      );

      // Очищаем текущие товары
      setDisplayedItems([]);

      // Через 50 мс показываем отсортированный список с анимацией
      scheduleCleanup(() => {
        const animated = sorted.map((item, idx) => ({
          ...item,
          _justAdded: true,
          _animationDelay: `${idx * 0.1}s`,
        }));
        setDisplayedItems(animated);

        // Сброс флага _justAdded через 600 мс
        scheduleCleanup(() => {
          setDisplayedItems((curr) =>
            curr.map((i) => ({ ...i, _justAdded: false })),
          );
        }, 600);
        scheduleUnblock(400);
      }, 50);
    },
    [
      sort.by,
      sort.dir,
      ratings,
      favorites,
      baseDisplayedItems,
      setDisplayedItems,
      scheduleCleanup,
      scheduleUnblock,
    ],
  );

  const handleLoadMore = useCallback(async () => {
    if (isLoadMoreRef.current) return;
    isLoadMoreRef.current = true;

    if (sort.by === "favorites") {
      loadMoreFavorites();
      return;
    }

    const nextPage = pageCountRef.current + 1;
    const newCopies = makeStableCopies(originalItems, LOAD_MORE_COUNT);

    const patch: Record<string, number> = {};
    for (const copy of newCopies) {
      if (ratings[copy.instanceId!] == null) {
        patch[copy.instanceId!] = Math.floor(Math.random() * 3) + 3;
      }
    }

    if (Object.keys(patch).length) {
      dispatch(setManyRatings(patch));
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

    updateBaseDisplayedItems((prev) => [...prev, ...newCopies]);
    pageCountRef.current = nextPage;

    if (sort.by === "default") {
      loadMoreDefault(newCopies);
    } else if (sort.by === "price" || sort.by === "rating") {
      loadMoreSorted(newCopies, patch);
    } else {
      loadMoreDefault(newCopies);
    }
  }, [
    sort.by,
    originalItems,
    ratings,
    isAuth,
    dispatch,
    updateBaseDisplayedItems,
    makeStableCopies,
    loadMoreFavorites,
    loadMoreDefault,
    loadMoreSorted,
  ]);

  const resetPagination = useCallback(() => {
    pageCountRef.current = 1;
    isLoadMoreRef.current = false;
    clearTimers();
  }, [clearTimers]);

  return {
    handleLoadMore,
    resetPagination,
    noMorePulse,
    setNoMorePulse,
  };
};
