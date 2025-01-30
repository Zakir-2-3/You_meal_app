"use client";

import { useEffect, useState } from "react";

import HeroSection from "@/components/HeroSection/HeroSection";
import FoodCategories from "@/components/FoodCategories/FoodCategories";
import CartSidebar from "@/components/CartSidebar/CartSidebar";
import FoodCard from "@/components/FoodCard/FoodCard";

import "@/styles/home.scss";

export default function Home() {
  const [items, setItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeCategoryName, setActiveCategoryName] =
    useState("Бургеры");
  const [cartItems, setCartItems] = useState([]);

  const handleButtonClick = (index: number, title: string) => {
    setActiveIndex(index);
    setActiveCategoryName(title);
  };

  const handleAddToCart = (item) => {
    setCartItems((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  useEffect(() => {
    fetch("https://6794c225aad755a134ea56b6.mockapi.io/items")
      .then((res) => res.json())
      .then((data) => setItems(data[activeIndex]?.items || []));
  }, [activeIndex]);

  return (
    <>
      <HeroSection />
      <div className="container main-content-wrapper">
        <FoodCategories
          activeIndex={activeIndex}
          onButtonClick={handleButtonClick}
        />
        <CartSidebar cartItems={cartItems} />
        <section className="food-section">
          <h2 className="food-section__title">{activeCategoryName}</h2>
          <div className="food-section__wrapper">
            {items.map((obj) => (
              <FoodCard
                key={obj.id}
                {...obj}
                onAddToCart={() => handleAddToCart(obj)}
              />
            ))}
          </div>
          <button className="food-section__load-more">Загрузить еще</button>
        </section>
      </div>
    </>
  );
}
