"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";

import { clearItems } from "@/store/slices/cart.slice";

import Image from "next/image";

import CartPageItem from "@/components/CartPage/CartPageItem/CartPageItem";
import CartPageCheck from "@/components/CartPage/CartPageCheck/CartPageCheck";

import clearCartIcon from "@/assets/icons/clear-cart-icon.svg";
import emptyCartImg from "@/assets/images/empty-cart-img.png";

import "./cartPage.scss";

export default function CartPage() {
  const { items } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();

  const onClickClearCart = () => {
    if (items.length > 0) {
      window.confirm("Очистить корзину ?");
      dispatch(clearItems());
    }
  };

  return (
    <section className="cart-page-section">
      <div className="container cart-page-container">
        <h1 className="cart-page-section__title">Корзина</h1>
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
              {items.map((item) => (
                <CartPageItem key={item.id} {...item} />
              ))}
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
      </div>
    </section>
  );
}
