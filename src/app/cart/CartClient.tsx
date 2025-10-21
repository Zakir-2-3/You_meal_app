"use client";

import Image from "next/image";

import { useEffect, useState } from "react";

import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { clearItems } from "@/store/slices/cartSlice";
import { clearTips } from "@/store/slices/tipsSlice";

import CartPageItem from "@/components/CartPage/CartPageItem/CartPageItem";
import CartPageCheck from "@/components/CartPage/CartPageCheck/CartPageCheck";

import { getDiscountedPrice } from "@/utils/getDiscountedPrice";

import { useTranslate } from "@/hooks/useTranslate";

import CartPageItemSkeleton from "@/ui/skeletons/CartPageItemSkeleton";

import clearCartIcon from "@/assets/icons/clear-cart-icon.svg";
import emptyCartImg from "@/assets/images/empty-cart-img.png";

import "./cartPage.scss";

export default function CartClient() {
  const [isLoading, setIsLoading] = useState(true);
  const [popup, setPopup] = useState<null | {
    type: "auth" | "success";
    orderNumber?: number;
  }>(null);

  const { items } = useSelector((state: RootState) => state.cart);
  const activated = useSelector((state: RootState) => state.promo.activated);
  const { percentage: tipsPercent } = useSelector((s: RootState) => s.tips);
  const { isAuth, email } = useSelector((s: RootState) => s.user);

  const dispatch = useDispatch<AppDispatch>();

  const { t, lang } = useTranslate();

  const { clearCart, checkout, ok } = t.buttons;
  const {
    emptyCart2,
    orderPopupCart,
    orderPopupCart2,
    orderPopupCart3,
    orderPopupCart4,
  } = t.cart;

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const onClickClearCart = () => {
    if (items.length > 0) {
      window.confirm(`${clearCart} ?`) && dispatch(clearItems());
      dispatch(clearTips());
    }
  };

  const handleCheckout = async () => {
    if (!isAuth || !email) {
      setPopup({ type: "auth" });
      return;
    }

    try {
      // Чистый счёт (без скидок)
      const rawTotal = items.reduce(
        (sum, item) => sum + item.price_rub * (item.count ?? 0),
        0
      );

      // Считаем скидку
      const { discount } = getDiscountedPrice(activated, rawTotal);
      const discountedTotal = Math.round(rawTotal * (1 - discount / 100));

      // Сколько сэкономили
      const savedMoney = rawTotal - discountedTotal;

      // НДС и чаевые
      const vat = Math.round(discountedTotal * 0.05);
      const tips = Math.round((discountedTotal + vat) * tipsPercent);

      // Итог
      const finalTotal = discountedTotal + vat + tips;

      // Отправляем в API все данные
      const res = await fetch("/api/user/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          items,
          rawTotal, // чистый счёт
          discount,
          savedMoney, // сколько сэкономили
          vat,
          tips,
          tipsPercent: tipsPercent * 100,
          finalTotal,
          activated,
          lang,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        dispatch(clearItems());
        dispatch(clearTips());
        setPopup({ type: "success", orderNumber: data.orderNumber });
      } else {
        console.error("Ошибка заказа:", data.error);
      }
    } catch (err) {
      console.error("Ошибка:", err);
    }
  };

  return (
    <>
      <div
        className={`cart-page-section__list-wrapper ${
          items.length === 0 ? "cart-page-section__list-wrapper--empty" : ""
        }`}
      >
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
          {clearCart}
        </button>
        {items.length > 0 ? (
          <ul className="cart-page-section__list">
            {isLoading
              ? [...new Array(3)].map((_, index) => (
                  <CartPageItemSkeleton key={index} />
                ))
              : items.map((item) => (
                  <CartPageItem key={item.instanceId} {...item} />
                ))}
          </ul>
        ) : (
          <>
            <Image
              src={emptyCartImg}
              className="empty-cart-img"
              priority
              alt="empty-cart-img"
              width={495}
              height={233}
            />
            <p className="empty-cart-text">{emptyCart2}</p>
          </>
        )}
      </div>
      <div className="cart-page-section__right-side">
        <div className="cart-page-section__total-price">
          <CartPageCheck />
        </div>
        <button onClick={handleCheckout} className="cart-page-section__pay-btn">
          {checkout}
        </button>

        {popup?.type === "auth" && (
          <div className="popup">
            <div className="popup__content">
              <p>{orderPopupCart4}</p>
              <button
                className="popup__content-button"
                onClick={() => setPopup(null)}
              >
                OK
              </button>
            </div>
          </div>
        )}
        {popup?.type === "success" && (
          <div className="popup">
            <div className="popup__content">
              <p>
                {orderPopupCart}
                {popup.orderNumber} {orderPopupCart2}
                <br />
                {orderPopupCart3}
              </p>
              <button
                className="popup__content-button"
                onClick={() => setPopup(null)}
              >
                {ok}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
