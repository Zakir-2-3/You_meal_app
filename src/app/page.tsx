"use client";

import axios from "axios";

import { useEffect, useState } from "react";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

import { Item } from "@/types/item";

import FoodCardSkeleton from "@/ui/skeletons/FoodCardSkeleton";
import HeroSection from "@/components/HeroSection/HeroSection";
import FoodCategories from "@/components/FoodCategories/FoodCategories";
import FoodCategoriesSearch from "@/components/FoodCategoriesSearch/FoodCategoriesSearch";
import CartSidebar from "@/components/CartSidebar/CartSidebar";
import FoodCard from "@/components/FoodCard/FoodCard";

import "@/styles/home.scss";

export default function Home() {
  const [searchValue, setSearchValue] = useState(""); // Состояние поиска
  const [isLoading, setIsLoading] = useState(true); // Флаг загрузки
  const [items, setItems] = useState<Item[]>([]); // Данные
  const activeCategoryName = useSelector(
    (state: RootState) => state.category.activeCategoryName
  );

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
              items.map((obj) => (
                <FoodCard key={Number(obj.id)} {...obj} id={Number(obj.id)} />
              ))
            ) : (
              <p className="food-section__empty">
                <b>¯\_(ツ)_/¯</b>
                <br /> Ничего не найдено
              </p>
            )}
          </div>
          {!isLoading && items.length > 0 && (
            <button className="food-section__load-more">Загрузить еще</button>
          )}
        </section>
      </div>
    </>
  );
}
