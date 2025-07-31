"use client";

import axios from "axios";

import { useEffect, useState } from "react";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

import HeroSection from "@/components/HeroSection/HeroSection";
import FoodCategories from "@/components/FoodCategories/FoodCategories";
import FoodCategoriesSearch from "@/components/FoodCategoriesSearch/FoodCategoriesSearch";
import CartSidebar from "@/components/CartSidebar/CartSidebar";
import FoodCard from "@/components/FoodCard/FoodCard";

import { Item } from "@/types/item";

import FoodCardSkeleton from "@/ui/skeletons/FoodCardSkeleton";

import "@/styles/home.scss";

export default function Home() {
  const [searchValue, setSearchValue] = useState(""); // Состояние поиска
  const [isLoading, setIsLoading] = useState(true); // Флаг загрузки
  const [items, setItems] = useState<Item[]>([]); // Все загруженные товары
  const [displayedItems, setDisplayedItems] = useState<Item[]>([]); // Товары показанные на экране
  const [animateItems, setAnimateItems] = useState(false);

  const activeCategoryName = useSelector(
    (state: RootState) => state.category.activeCategoryName
  );

  const handleLoadMore = () => {
    setDisplayedItems((prev) => [...prev, ...items]);
  };

  useEffect(() => {
    if (!isLoading) {
      setAnimateItems(true);
      const timer = setTimeout(() => {
        setAnimateItems(false); // сбросим, если нужно повторно запускать
      }, 500); // Задержка больше, чем анимация

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const categoryParam =
          searchValue === "" && activeCategoryName
            ? `category=${activeCategoryName}`
            : "";
        const searchParam = searchValue ? `search=${searchValue}` : "";
        const queryParams = [categoryParam, searchParam]
          .filter(Boolean)
          .join("&");

        const res = await axios.get(
          `https://6794c225aad755a134ea56b6.mockapi.io/items?${queryParams}`
        );
        setItems(res.data);
        setDisplayedItems(res.data); // Отображаем первую часть
      } catch {
        setItems([]); // Если ошибка, пустой массив
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeCategoryName, searchValue]);

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
          <h2 className="food-section__title">{activeCategoryName}</h2>
          <div className="food-section__wrapper">
            {isLoading ? (
              [...new Array(6)].map((_, index) => (
                <FoodCardSkeleton key={index} />
              ))
            ) : items.length > 0 ? (
              displayedItems.map((obj, index) => (
                <div
                  key={`item-${obj.id}-${index}`}
                  className="food-card-animated-wrapper"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <FoodCard {...obj} id={Number(obj.id)} />
                </div>
              ))
            ) : (
              <p className="food-section__empty">
                <b>¯\_(ツ)_/¯</b>
                <br /> Ничего не найдено
              </p>
            )}
          </div>
          {!isLoading && items.length > 0 && (
            <button
              className="food-section__load-more"
              onClick={handleLoadMore}
            >
              Загрузить еще
            </button>
          )}
        </section>
      </div>
    </>
  );
}
