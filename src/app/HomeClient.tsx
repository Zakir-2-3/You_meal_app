"use client";

import { useEffect, useState, useRef, useCallback } from "react";

import { usePathname, useSearchParams } from "next/navigation";

import { toast } from "react-toastify";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setSort } from "@/store/slices/productMetaSlice";
import { setActiveCategory } from "@/store/slices/categorySlice";

import HomeContent from "@/components/home/HomeContent";
import HeroSection from "@/components/layout/HeroSection/HeroSection";

import { useTranslate } from "@/hooks/app/useTranslate";
import { useProductLoader } from "@/hooks/product/useProductLoader";
import { useProductPagination } from "@/hooks/product/useProductPagination";

import { sortItemsWithAnimation } from "@/utils/cart/insertSorted";

import { categories } from "@/constants/user/categories";

import LoadingSpinner from "@/UI/loaders/LoadingSpinner";

import { UIItem } from "@/types/utils/insert-sorted";
import type { CategoryKey } from "@/types/product/category";

import "@/styles/home.scss";

export default function HomeClient() {
  const {
    originalItems,
    baseDisplayedItems,
    uiPhase,
    loadProducts,
    resetProducts,
    updateBaseDisplayedItems,
  } = useProductLoader();

  const searchParams = useSearchParams();

  const dispatch = useDispatch<AppDispatch>();

  const { activeIndex } = useSelector((state: RootState) => state.category);
  const { ratings, favorites, sort } = useSelector(
    (state: RootState) => state.productMeta,
  );

  const [isProductNavigating, setIsProductNavigating] = useState(false);
  const [displayedItems, setDisplayedItems] = useState<UIItem[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [prevSortDir, setPrevSortDir] = useState(sort.dir);
  const [prevSortBy, setPrevSortBy] = useState(sort.by);
  const [searchValue, setSearchValue] = useState("");

  const { t } = useTranslate();
  const pathname = usePathname();

  const categoryKey = categories[activeIndex]?.key as CategoryKey | undefined;
  const { nothingFound } = t.product;

  const isLoadingRef = useRef(false);
  const lastCategoryRef = useRef<string | undefined>(undefined);
  const lastSearchRef = useRef<string>("");
  const initialFavLoadDone = useRef(false);

  const { handleLoadMore, resetPagination, noMorePulse } = useProductPagination(
    {
      originalItems,
      baseDisplayedItems,
      updateBaseDisplayedItems,
      displayedItems,
      setDisplayedItems,
    },
  );

  const loadProductsStable = useCallback(async () => {
    if (!categoryKey) return;

    if (isLoadingRef.current) return;
    if (
      lastCategoryRef.current === categoryKey &&
      lastSearchRef.current === searchValue
    ) {
      return;
    }

    isLoadingRef.current = true;
    lastCategoryRef.current = categoryKey;
    lastSearchRef.current = searchValue;

    try {
      resetPagination();
      setDisplayedItems([]);
      initialFavLoadDone.current = false;
      await loadProducts(categoryKey, searchValue);
    } catch (e: any) {
      console.error("Load error:", e);
      resetProducts();
      setDisplayedItems([]);
    } finally {
      isLoadingRef.current = false;
    }
  }, [categoryKey, searchValue, loadProducts, resetProducts, resetPagination]);

  useEffect(() => {
    if (!categoryKey) return;
    const timer = setTimeout(() => loadProductsStable(), 100);
    return () => clearTimeout(timer);
  }, [categoryKey, searchValue, loadProductsStable]);

  // Основной эффект для первой загрузки и смены сортировки
  useEffect(() => {
    if (uiPhase !== "ready" || !baseDisplayedItems.length) return;

    if (displayedItems.length === 0) {
      let animated: UIItem[];

      if (sort.by === "favorites") {
        const LOAD_MORE_COUNT = 6;
        const favSet = new Set(favorites);
        const favItems = baseDisplayedItems.filter((it) =>
          favSet.has(it.instanceId!),
        );

        const missingIds = [...favSet].filter(
          (iid) => !baseDisplayedItems.some((it) => it.instanceId === iid),
        );

        const extraItems = missingIds
          .map((iid) => {
            const originalId = iid.includes("-copy-")
              ? iid.split("-copy-")[0]
              : iid;
            const original = baseDisplayedItems.find(
              (it) => String(it.id) === originalId,
            );
            if (!original) return null;
            return { ...original, instanceId: iid };
          })
          .filter(Boolean) as UIItem[];

        const allFavItems = [...favItems, ...extraItems];
        const firstBatch = allFavItems.slice(0, LOAD_MORE_COUNT);
        animated =
          firstBatch.length === 0
            ? []
            : firstBatch.map((item, i) => ({
                ...item,
                _animationDelay: `${i * 0.15}s`,
                _justAdded: false,
              }));
        initialFavLoadDone.current = true;
      } else if (sort.by === "default") {
        animated = baseDisplayedItems.map((item, i) => ({
          ...item,
          _animationDelay: `${i * 0.15}s`,
          _justAdded: false,
        }));
      } else {
        animated = sortItemsWithAnimation(
          baseDisplayedItems,
          sort,
          ratings,
          favorites,
        );
      }

      setDisplayedItems(animated);
      setPrevSortBy(sort.by);
      setPrevSortDir(sort.dir);
      return;
    }

    const sortKey = `${sort.by}-${sort.dir}`;
    const prevSortKey = `${prevSortBy}-${prevSortDir}`;

    if (sortKey === prevSortKey) return;

    let newItems: UIItem[];

    if (sort.by === "favorites") {
      const favSet = new Set(favorites);
      const favItems = baseDisplayedItems.filter((it) =>
        favSet.has(it.instanceId!),
      );
      newItems =
        favItems.length === 0
          ? []
          : sortItemsWithAnimation(favItems, sort, ratings, favorites);
    } else if (sort.by === "default") {
      newItems = baseDisplayedItems.map((item, i) => ({
        ...item,
        _animationDelay: `${i * 0.15}s`,
        _justAdded: false,
      }));
    } else {
      newItems = sortItemsWithAnimation(
        baseDisplayedItems,
        sort,
        ratings,
        favorites,
      );
    }

    setDisplayedItems(newItems);
    setPrevSortBy(sort.by);
    setPrevSortDir(sort.dir);
  }, [
    uiPhase,
    baseDisplayedItems,
    sort.by,
    sort.dir,
    ratings,
    favorites,
    displayedItems.length,
  ]);

  useEffect(() => {
    if (uiPhase === "loading" && baseDisplayedItems.length === 0) {
      setDisplayedItems([]);
      initialFavLoadDone.current = false;
    }
  }, [uiPhase, baseDisplayedItems.length]);

  const handleRemoveFromFavorites = useCallback((instanceId: string) => {
    setDisplayedItems((prev) =>
      prev.filter((item) => item.instanceId !== instanceId),
    );
    initialFavLoadDone.current = false;
  }, []);

  useEffect(() => {
    const navCategory = sessionStorage.getItem("navCategory");
    if (navCategory === "__reset__") {
      dispatch(setActiveCategory({ index: 0, key: "burgers" }));
      sessionStorage.removeItem("navCategory");
    } else if (navCategory) {
      const foundIndex = categories.findIndex((c) => c.key === navCategory);
      if (foundIndex !== -1) {
        dispatch(setActiveCategory({ index: foundIndex, key: navCategory }));
      }
      sessionStorage.removeItem("navCategory");
    }
  }, []);

  useEffect(() => {
    setIsProductNavigating(false);
  }, [pathname]);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "EmailAlreadyRegistered") {
      toast.error(t.toastTr.emailAlreadyRegisteredByPassword);
      // Убираем параметр из адреса без перезагрузки
      window.history.replaceState({}, "", "/");
    }
  }, [searchParams, t]);

  const showOverlay = uiPhase === "loading";

  return (
    <>
      <HeroSection />
      <HomeContent
        displayedItems={displayedItems}
        uiPhase={uiPhase}
        sortBy={sort.by}
        sortDir={sort.dir}
        nothingFoundText={nothingFound}
        searchValue={searchValue}
        isSearchOpen={isSearchOpen}
        setSearchValue={setSearchValue}
        onSearchToggle={setIsSearchOpen}
        onRemoveFromFavorites={handleRemoveFromFavorites}
        handleLoadMore={handleLoadMore}
        noMorePulse={noMorePulse}
        handleSortChange={(next) => dispatch(setSort(next))}
        isProductNavigating={isProductNavigating}
        onProductNavigate={() => setIsProductNavigating(true)}
      />
      {showOverlay && (
        <>
          <div className="overlay-loading" />
          <div className="overlay-spinner">
            <LoadingSpinner />
          </div>
        </>
      )}
    </>
  );
}
