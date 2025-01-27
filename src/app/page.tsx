"use client";

import { useEffect, useState } from "react";

import HeroSection from "@/components/HeroSection/HeroSection";
import FoodCategories from "@/components/FoodCategories/FoodCategories";
import CartSidebar from "@/components/CartSidebar/CartSidebar";
import FoodCard from "@/components/FoodCard/FoodCard";

import "@/styles/home.scss";

export default function Home() {
  const [items, setItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [activeCategoryName, setActiveCategoryName] = useState<string>("Бургеры");

  const handleButtonClick = (index: number, title: string) => {
    setActiveIndex(index);
    setActiveCategoryName(title);
  };

  useEffect(() => {
    fetch("https://6794c225aad755a134ea56b6.mockapi.io/items")
      .then((res) => res.json())
      .then((data) => setItems(data[activeIndex]?.items || []));
  }, [activeIndex]);

  return (
    <>
      <HeroSection />
      <div className="container food-container">
        <FoodCategories activeIndex={activeIndex} onButtonClick={handleButtonClick}/>
        <CartSidebar />
        <section className="food-section">
          <h2 className="food-section__title">{activeCategoryName}</h2>
          <div className="food-section__wrapper">
            {items.map((obj) => (
              <FoodCard key={obj.id} {...obj}/>
            ))}
          </div>
          <button className="food-section__load-more">Загрузить еще</button>
        </section>
      </div>
    </>
  );
}
