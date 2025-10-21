"use client";

import axios from "axios";

import { useEffect, useState, useRef } from "react";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import {
  resetMeta,
  setManyRatings,
  setSort,
} from "@/store/slices/productMetaSlice";

import HeroSection from "@/components/HeroSection/HeroSection";
import FoodCategories from "@/components/FoodCategories/FoodCategories";
import FoodCategoriesSearch from "@/components/FoodCategoriesSearch/FoodCategoriesSearch";
import CartSidebar from "@/components/CartSidebar/CartSidebar";
import { translations } from "@/components/i18n/translations";
import FoodCard from "@/components/FoodCard/FoodCard";
import SortBar from "@/components/SortBar/SortBar";

import {
  insertSorted,
  sortItemsWithAnimation,
  UIItem,
} from "@/utils/insertSorted";
import { syncUserMetaIfAuth } from "@/utils/syncUserMeta";

import { useTranslate } from "@/hooks/useTranslate";

import { categories } from "@/constants/categories";

import FoodCardSkeleton from "@/ui/skeletons/FoodCardSkeleton";

import type { CategoryKey } from "@/types/category";
import { Item } from "@/types/item";

import "@/styles/home.scss";

export default function Home() {
  const [originalItems, setOriginalItems] = useState<Item[]>([]);
  const [baseDisplayedItems, setBaseDisplayedItems] = useState<Item[]>([]);
  const [displayedItems, setDisplayedItems] = useState<UIItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [noMorePulse, setNoMorePulse] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const { ratings, favorites, sort } = useSelector(
    (s: RootState) => s.productMeta
  );
  const { isAuth, email } = useSelector((s: RootState) => s.user);
  const rehydrated = useSelector((s: any) => s._persist?.rehydrated);
  const metaSynced = useSelector((s: RootState) => s.productMeta.metaSynced);
  const { activeKey } = useSelector((state: RootState) => state.category);

  const { t } = useTranslate();

  const categoryTitle = (t.categories as Record<string, string>)[activeKey];

  const LOAD_MORE_COUNT = 6;

  const activeIndex = useSelector(
    (state: RootState) => state.category.activeIndex
  );
  const categoryKey = categories[activeIndex]?.key as CategoryKey | undefined;

  const { loadMore } = t.buttons;
  const { nothingFound } = t.product;

  // Для отслеживания номера страницы
  const pageCountRef = useRef(1);
  const isLoadMoreRef = useRef(false);

  // Функция для создания стабильного instanceId для копии
  const generateCopyInstanceId = (
    originalId: number | string,
    copyNumber: number
  ): string => {
    return `${originalId}-copy-${copyNumber}`;
  };

  // Функция создания копий с стабильными ID
  const makeStableCopies = (
    originals: Item[],
    count: number,
    page: number
  ): Item[] => {
    const copies: Item[] = [];

    // Для каждого оригинала ведём отдельный счётчик копий
    for (let i = 0; i < count; i++) {
      const original = originals[i % originals.length];
      const originalId = original.id;

      // Определяем, сколько копий этого товара уже было создано
      const existingCopies = baseDisplayedItems.filter(
        (item) =>
          item.instanceId !== String(originalId) && // Исключаем оригинал
          item.instanceId?.startsWith(`${originalId}-copy-`)
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
  };

  const handleLoadMore = () => {
    isLoadMoreRef.current = true;

    if (sort.by === "favorites") {
      const favs = baseDisplayedItems.filter((it) =>
        favorites.includes(it.instanceId!)
      );
      if (displayedItems.length < favs.length) {
        const nextCount = Math.min(
          displayedItems.length + LOAD_MORE_COUNT,
          favs.length
        );
        const nextSlice = favs
          .slice(displayedItems.length, nextCount)
          .map((it, idx) => ({
            ...it,
            _justAdded: true,
            _animationDelay: `${idx * 0.1}s`,
          })) as UIItem[];

        setDisplayedItems((prev) => [...prev, ...nextSlice]);

        setTimeout(() => {
          setDisplayedItems((curr) =>
            curr.map((i) => ({ ...i, _justAdded: false }))
          );
          isLoadMoreRef.current = false;
        }, 450);
        return;
      }

      setNoMorePulse(true);
      setTimeout(() => setNoMorePulse(false), 350);
      isLoadMoreRef.current = false;
      return;
    }

    const nextPage = pageCountRef.current + 1;
    const newCopies = makeStableCopies(
      originalItems,
      LOAD_MORE_COUNT,
      nextPage
    );

    // Обновляем рейтинги для новых копий
    const patch: Record<string, number> = {};
    for (const copy of newCopies) {
      if (ratings[copy.instanceId!] == null) {
        patch[copy.instanceId!] = Math.floor(Math.random() * 3) + 3;
      }
    }
    if (Object.keys(patch).length) {
      dispatch(setManyRatings(patch));
    }

    // Добавляем новые копии в базовый список
    setBaseDisplayedItems((prev) => [...prev, ...newCopies]);
    pageCountRef.current = nextPage;

    // Обновляем displayedItems в зависимости от сортировки
    if (sort.by === "default") {
      setDisplayedItems((prev) => {
        const appended = newCopies.map((it, idx) => ({
          ...it,
          _justAdded: true,
          _animationDelay: `${idx * 0.1}s`,
        })) as UIItem[];
        setTimeout(() => {
          setDisplayedItems((curr) =>
            curr.map((i) => ({ ...i, _justAdded: false }))
          );
          isLoadMoreRef.current = false;
        }, 450);
        return [...prev, ...appended];
      });
      return;
    }

    if (sort.by === "price" || sort.by === "rating") {
      setDisplayedItems((prev) => {
        const updated = insertSorted(
          prev,
          newCopies,
          { by: sort.by, dir: sort.dir },
          { ...ratings, ...patch },
          favorites
        );
        setTimeout(() => {
          setDisplayedItems((curr) =>
            curr.map((i) => ({ ...i, _justAdded: false }))
          );
          isLoadMoreRef.current = false;
        }, 400);
        return updated as UIItem[];
      });
      return;
    }

    // fallback
    setDisplayedItems((prev) => {
      const appended = newCopies.map((it, idx) => ({
        ...it,
        _justAdded: true,
        _animationDelay: `${idx * 0.1}s`,
      })) as UIItem[];
      setTimeout(() => {
        setDisplayedItems((curr) =>
          curr.map((i) => ({ ...i, _justAdded: false }))
        );
        isLoadMoreRef.current = false;
      }, 450);
      return [...prev, ...appended];
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setOriginalItems([]);
      setBaseDisplayedItems([]);
      setDisplayedItems([]);
      try {
        // Используем ру название категории для mockapi-запроса
        const categoryParam =
          searchValue === "" && categoryKey
            ? `category=${encodeURIComponent(
                translations.ru.categories[categoryKey]
              )}`
            : "";
        const searchParam = searchValue ? `search=${searchValue}` : "";
        const queryParams = [categoryParam, searchParam]
          .filter(Boolean)
          .join("&");

        const res = await axios.get<Item[]>(
          `https://6794c225aad755a134ea56b6.mockapi.io/items?${queryParams}`
        );
        const data = res.data ?? [];
        const dataWithInstance = data.map((it) => ({
          ...it,
          instanceId: String(it.id), // Для оригиналов instanceId = id
        }));

        setOriginalItems(dataWithInstance);
        setBaseDisplayedItems(dataWithInstance);
        pageCountRef.current = 1;

        // Инициализируем рейтинги только для оригиналов
        const patch: Record<string, number> = {};
        for (const it of dataWithInstance) {
          if (ratings[it.instanceId!] == null) {
            patch[it.instanceId!] = Math.floor(Math.random() * 3) + 3;
          }
        }
        if (Object.keys(patch).length) {
          dispatch(setManyRatings(patch));
        }
      } catch (e) {
        setOriginalItems([]);
        setBaseDisplayedItems([]);
        console.error("Ошибка загрузки товаров:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [categoryKey, searchValue, dispatch]);

  useEffect(() => {
    if (!baseDisplayedItems.length) {
      setDisplayedItems([]);
      return;
    }

    if (isLoadMoreRef.current) return;

    const withAnimation = sortItemsWithAnimation(
      baseDisplayedItems,
      sort,
      ratings,
      favorites
    );
    setDisplayedItems(withAnimation);
  }, [sort, ratings, favorites, baseDisplayedItems]);

  useEffect(() => {
    const initializeMetaData = async () => {
      if (!rehydrated) return;
      if (isAuth && email && !metaSynced) {
        const serverMeta = await dispatch(syncUserMetaIfAuth());
        if (serverMeta) {
          console.log("Метаданные загружены с сервера");
        }
      } else if (!isAuth && metaSynced) {
        dispatch(resetMeta());
      }
    };
    initializeMetaData();
  }, [isAuth, email, rehydrated, metaSynced, dispatch]);

  return (
    <>
      <HeroSection />
      <div className="container main-content-wrapper">
        <nav className="food-categories">
          <FoodCategories />
          <FoodCategoriesSearch setSearchValue={setSearchValue} />
        </nav>

        <CartSidebar isLoading={isLoading} />

        <section className="food-section">
          <h2 className="food-section__title">{categoryTitle}</h2>

          <SortBar
            by={sort.by}
            dir={sort.dir}
            onChange={(next) => dispatch(setSort(next))}
          />

          <div className="food-section__wrapper">
            {isLoading ? (
              [...new Array(6)].map((_, i) => <FoodCardSkeleton key={i} />)
            ) : displayedItems.length > 0 ? (
              displayedItems.map((obj, i) => (
                <div
                  key={obj.instanceId}
                  className={`food-card-animated-wrapper ${
                    obj._justAdded
                      ? sort.by === "price" || sort.by === "rating"
                        ? "food-card-just-added-fast"
                        : "food-card-just-added"
                      : ""
                  }`}
                  style={{
                    animationDelay: obj._animationDelay ?? "0s",
                  }}
                >
                  <FoodCard
                    {...obj}
                    id={Number(obj.id)}
                    instanceId={obj.instanceId}
                  />
                </div>
              ))
            ) : !isLoading ? (
              <p className="food-section__empty">
                <b>¯\_(ツ)_/¯</b>
                <br /> {nothingFound}
              </p>
            ) : null}
          </div>

          {!isLoading &&
            baseDisplayedItems.length > 0 &&
            (sort.by !== "favorites" || displayedItems.length > 0) && (
              <button
                className={`food-section__load-more ${
                  noMorePulse ? "food-section__load-more--nudge" : ""
                }`}
                onClick={handleLoadMore}
              >
                {loadMore}
              </button>
            )}
        </section>
      </div>
    </>
  );
}
