"use client";

import { useEffect, useState } from "react";

import axios from "axios";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

import HeroSection from "@/components/HeroSection/HeroSection";
import FoodCategories from "@/components/FoodCategories/FoodCategories";
import CartSidebar from "@/components/CartSidebar/CartSidebar";
import FoodCard from "@/components/FoodCard/FoodCard";

import FoodCardSkeleton from "@/components/ui/skeletons/FoodCardSkeleton";

import "@/styles/home.scss";

export default function Home() {
  const [cartItems, setCartItems] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState([]);

  const activeCategoryName = useSelector(
    (state: RootState) => state.category.activeCategoryName
  );

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
    setIsLoading(true);

    axios
      .get(
        `https://6794c225aad755a134ea56b6.mockapi.io/items${
          searchValue
            ? `?search=${searchValue}`
            : `?category=${activeCategoryName}`
        }`
      )
      .then((res) => {
        setItems(res.data);
      })
      .catch(() => {
        setItems([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [activeCategoryName, searchValue]);

  return (
    <>
      <HeroSection />
      <div className="container main-content-wrapper">
        <FoodCategories setSearchValue={setSearchValue} />
        <CartSidebar
          cartItems={cartItems}
          setCartItems={setCartItems}
          isLoading={isLoading}
        />
        <section className="food-section">
          <h2 className="food-section__title">{activeCategoryName}</h2>
          <div className="food-section__wrapper">
            {isLoading ? (
              [...new Array(6)].map((_, index) => (
                <FoodCardSkeleton key={index} />
              ))
            ) : items.length > 0 ? (
              items.map((obj) => {
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
