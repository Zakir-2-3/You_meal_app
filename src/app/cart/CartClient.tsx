"use client";

import Image from "next/image";

import { useEffect, useState } from "react";

import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { clearItems } from "@/store/slices/cartSlice";

import CartPageItem from "@/components/CartPage/CartPageItem/CartPageItem";
import CartPageCheck from "@/components/CartPage/CartPageCheck/CartPageCheck";

import CartPageItemSkeleton from "@/ui/skeletons/CartPageItemSkeleton";

import clearCartIcon from "@/assets/icons/clear-cart-icon.svg";
import emptyCartImg from "@/assets/images/empty-cart-img.png";

import "./cartPage.scss";

export default function CartClient() {
  const { items } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(true); // Состояние загрузки

  useEffect(() => {
    // setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000); // Задержка загрузки в 1 секунду
  }, []);

  const onClickClearCart = () => {
    if (items.length > 0) {
      window.confirm("Очистить корзину ?") && dispatch(clearItems());
    }
  };

  return (
    <>
      <div className="cart-page-section__list-wrapper">
        <button
          onClick={onClickClearCart}
          className="cart-page-section__clear-cart"
        >
          <Image
            src={clearCartIcon}
            alt="clear-cart-icon"
            width={17}
            height={17}
          />
          Очистить корзину
        </button>
        {items.length > 0 ? (
          <ul className="cart-page-section__list">
            {isLoading
              ? [...new Array(3)].map((_, index) => (
                  <CartPageItemSkeleton key={index} />
                ))
              : items.map((item) => <CartPageItem key={item.id} {...item} />)}
          </ul>
        ) : (
          <Image
            src={emptyCartImg}
            className="empty-cart-img"
            alt="empty-cart-img"
            width={495}
            height={351}
          />
        )}
      </div>
      <div className="cart-page-section__right-side">
        <div className="cart-page-section__total-price">
          <CartPageCheck />
        </div>
        <button className="cart-page-section__pay-btn">Оформить заказ</button>
      </div>
    </>
  );
}
