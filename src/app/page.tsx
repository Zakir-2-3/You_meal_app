"use client";

import axios from "axios";

import { useEffect, useState } from "react";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

import { Item } from "@/types/item";

import FoodCardSkeleton from "@/components/ui/skeletons/FoodCardSkeleton";

import HeroSection from "@/components/HeroSection/HeroSection";
import FoodCategories from "@/components/FoodCategories/FoodCategories";
import CartSidebar from "@/components/CartSidebar/CartSidebar";
import FoodCard from "@/components/FoodCard/FoodCard";

import "@/styles/home.scss";

export default function Home() {
  const [searchValue, setSearchValue] = useState(""); // Состояние для поиска
  const [isLoading, setIsLoading] = useState(true); // Статус загрузки для скелетонов
  const [items, setItems] = useState<Item[]>([]); // Массив данных при добавлении в корзину
  const activeCategoryName = useSelector(
    (state: RootState) => state.category.activeCategoryName
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(
          `https://6794c225aad755a134ea56b6.mockapi.io/items${
            searchValue
              ? `?search=${searchValue}`
              : `?category=${activeCategoryName}`
          }`
        );
        setItems(res.data);
      } catch {
        setItems([]); // Пустой массив при ошибке
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
        <FoodCategories setSearchValue={setSearchValue} />
        <CartSidebar isLoading={isLoading} />
        <section className="food-section">
          <h2 className="food-section__title">{activeCategoryName}</h2>
          <div className="food-section__wrapper">
            {isLoading ? (
              [...new Array(6)].map((_, index) => (
                <FoodCardSkeleton key={index} />
              ))
            ) : items.length > 0 ? (
              items.map((obj) => {
                return <FoodCard key={obj.id} {...obj} />;
              })
            ) : (
              <p className="food-section__empty">
                <b>¯\_(ツ)_/¯</b>
                <br /> Ничего не найдено
              </p>
            )}
          </div>
          <button className="food-section__load-more">Загрузить еще</button>
        </section>
      </div>
    </>
  );
}
