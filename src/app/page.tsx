"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { resetMeta, setSort } from "@/store/slices/productMetaSlice";

import SortBar from "@/components/product/SortBar/SortBar";
import HeroSection from "@/components/layout/HeroSection/HeroSection";
import { ProductGrid } from "@/components/product/ProductGrid/ProductGrid";
import CartSidebar from "@/components/layout/Sidebar/CartSidebar/CartSidebar";
import FoodCategories from "@/components/product/FoodCategories/FoodCategories";
import FoodCategoriesSearch from "@/components/product/FoodCategoriesSearch/FoodCategoriesSearch";

import { useTranslate } from "@/hooks/app/useTranslate";
import { useProductLoader } from "@/hooks/product/useProductLoader";
import { useProductPagination } from "@/hooks/product/useProductPagination";

import { sortItemsWithAnimation } from "@/utils/cart/insertSorted";

import { categories } from "@/constants/user/categories";

import { LoadMoreButton } from "@/UI/buttons/LoadMoreButton/LoadMoreButton";

import { UIItem } from "@/types/utils/insert-sorted";
import type { CategoryKey } from "@/types/product/category";

import "@/styles/home.scss";

export default function Home() {
  const {
    originalItems,
    baseDisplayedItems,
    uiPhase,
    loadProducts,
    resetProducts,
    updateBaseDisplayedItems,
  } = useProductLoader();

  const [displayedItems, setDisplayedItems] = useState<UIItem[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { ratings, favorites, sort } = useSelector(
    (s: RootState) => s.productMeta,
  );
  const { isAuth, email } = useSelector((s: RootState) => s.user);
  const metaSynced = useSelector((s: RootState) => s.productMeta.metaSynced);
  const { activeKey, activeIndex } = useSelector((s: RootState) => s.category);

  const { t } = useTranslate();

  const categoryTitle = (t.categories as Record<string, string>)[activeKey];
  const categoryKey = categories[activeIndex]?.key as CategoryKey | undefined;

  const { loadMore } = t.buttons;
  const { nothingFound } = t.product;

  // Используем useRef для предотвращения повторных загрузок
  const isLoadingRef = useRef(false);
  const lastCategoryRef = useRef<string | undefined>(undefined);
  const lastSearchRef = useRef<string>("");

  const { handleLoadMore, resetPagination, noMorePulse } = useProductPagination(
    {
      originalItems,
      baseDisplayedItems,
      updateBaseDisplayedItems,
      displayedItems,
      setDisplayedItems,
    },
  );

  // Мемоизация анимированных товаров
  const memoizedDisplayedItems = useMemo(() => {
    if (uiPhase !== "ready" || !baseDisplayedItems.length)
      return displayedItems;

    return sortItemsWithAnimation(baseDisplayedItems, sort, ratings, favorites);
  }, [uiPhase, baseDisplayedItems, sort, ratings, favorites, displayedItems]);

  // Стабильная функция загрузки
  const loadProductsStable = useCallback(async () => {
    if (!categoryKey) return;

    // Проверяем, не загружаем ли уже или те же самые данные
    if (isLoadingRef.current) return;
    if (
      lastCategoryRef.current === categoryKey &&
      lastSearchRef.current === searchValue
    ) {
      // Если уже есть товары, просто обновляем displayedItems
      if (baseDisplayedItems.length > 0 && displayedItems.length === 0) {
        const animated = sortItemsWithAnimation(
          baseDisplayedItems,
          sort,
          ratings,
          favorites,
        );
        setDisplayedItems(animated);
      }
      return;
    }

    isLoadingRef.current = true;
    lastCategoryRef.current = categoryKey;
    lastSearchRef.current = searchValue;

    try {
      resetPagination();
      await loadProducts(categoryKey, searchValue);

      // Обновляем отображение
      const animated = sortItemsWithAnimation(
        baseDisplayedItems,
        sort,
        ratings,
        favorites,
      );
      setDisplayedItems(animated);
    } catch (e: any) {
      console.error("Load error:", e);
      resetProducts();
      setDisplayedItems([]);
    } finally {
      isLoadingRef.current = false;
    }
  }, [
    categoryKey,
    searchValue,
    loadProducts,
    resetProducts,
    resetPagination,
    baseDisplayedItems,
    displayedItems,
    sort,
    ratings,
    favorites,
  ]);

  useEffect(() => {
    // Не ждем rehydrated, сразу загружаем
    if (!categoryKey) return;

    const timer = setTimeout(() => {
      loadProductsStable();
    }, 100);

    return () => clearTimeout(timer);
  }, [categoryKey, searchValue]);

  useEffect(() => {
    // Только обновляем отображение при изменении сортировки/рейтингов
    if (uiPhase !== "ready" || !baseDisplayedItems.length) return;

    const timer = setTimeout(() => {
      const animated = sortItemsWithAnimation(
        baseDisplayedItems,
        sort,
        ratings,
        favorites,
      );
      setDisplayedItems(animated);
    }, 50);

    return () => clearTimeout(timer);
  }, [uiPhase, sort, ratings, favorites, baseDisplayedItems]);

  useEffect(() => {
    if (isAuth && email && !metaSynced) {
      // загрузка meta при авторизации
    } else if (!isAuth && metaSynced) {
      dispatch(resetMeta());
    }
  }, [isAuth, email, metaSynced, dispatch]);

  return (
    <>
      <HeroSection />

      <div className="container main-content-wrapper">
        <nav
          className={`food-categories ${
            isSearchOpen ? "food-categories--search-open" : ""
          }`}
        >
          <FoodCategories />
          <FoodCategoriesSearch
            setSearchValue={setSearchValue}
            onSearchToggle={setIsSearchOpen}
          />
        </nav>

        <CartSidebar isLoading={uiPhase === "loading"} />

        <section className="food-section">
          <h2 className="food-section__title">{categoryTitle}</h2>

          <SortBar
            by={sort.by}
            dir={sort.dir}
            onChange={(next) => dispatch(setSort(next))}
          />

          <ProductGrid
            items={memoizedDisplayedItems}
            uiPhase={uiPhase}
            sortBy={sort.by}
            nothingFoundText={nothingFound}
          />

          {uiPhase === "ready" &&
            baseDisplayedItems.length > 0 &&
            !searchValue &&
            (sort.by !== "favorites" || displayedItems.length > 0) && (
              <LoadMoreButton
                onClick={handleLoadMore}
                label={loadMore}
                noMorePulse={noMorePulse}
              />
            )}
        </section>
      </div>
    </>
  );
}
