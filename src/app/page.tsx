"use client";

import { useEffect, useState } from "react";

import HeroSection from "@/components/HeroSection/HeroSection";
import FoodCategories from "@/components/FoodCategories/FoodCategories";
import CartSidebar from "@/components/CartSidebar/CartSidebar";
import FoodCard from "@/components/FoodCard/FoodCard";

import FoodCardSkeleton from "@/components/ui/skeletons/FoodCardSkeleton";

import "@/styles/home.scss";

export default function Home() {
  const [items, setItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeCategoryName, setActiveCategoryName] = useState("Бургеры");
  const [cartItems, setCartItems] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const skeletonItems = "";

  // const search = searchValue ? `search=${searchValue}` : "";

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

  const handleRemoveFromCart = (item) => {
    setCartItems((prev) => prev.filter((cartItem) => cartItem.id !== item.id));
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // fetch(`https://6794c225aad755a134ea56b6.mockapi.io/items?${search}`)
    fetch(
      `https://6794c225aad755a134ea56b6.mockapi.io/items?category=${activeCategoryName}`
    )
      .then((res) => res.json())
      // .then((data) => setItems(data[activeIndex]?.items || []));
      .then((data) => {
        setItems(data);
        setIsLoading(false);
      });
    // }, [activeIndex, searchValue]);
  }, [activeCategoryName]);

  return (
    <>
      <HeroSection />
      <div className="container main-content-wrapper">
        <FoodCategories
          activeIndex={activeIndex}
          onButtonClick={handleButtonClick}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
        <CartSidebar
          cartItems={cartItems}
          setCartItems={setCartItems}
          isClient={isClient}
          isLoading={isLoading}
        />
        <section className="food-section">
          <h2 className="food-section__title">{activeCategoryName}</h2>
          <div className="food-section__wrapper">
            {isClient && isLoading
              ? [...new Array(6)].map((_, index) => (
                  <FoodCardSkeleton key={index} />
                ))
              : items.map((obj) => {
                  const isInCart = cartItems.some(
                    (cartItem) => cartItem.id === obj.id
                  );
                  return (
                    <FoodCard
                      key={obj.id}
                      {...obj}
                      isInCart={isInCart}
                      onAddToCart={() => handleAddToCart(obj)}
                      onRemoveFromCart={() => handleRemoveFromCart(obj)}
                    />
                  );
                })}
          </div>
          <button className="food-section__load-more">Загрузить еще</button>
        </section>
      </div>
    </>
  );
}
