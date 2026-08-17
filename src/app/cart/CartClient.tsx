"use client";

import Image from "next/image";

import { useEffect, useState } from "react";

import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { clearItems } from "@/store/slices/cartSlice";
import { clearTips } from "@/store/slices/tipsSlice";

import CartPageCheck from "@/components/cart/CartPageCheck/CartPageCheck";
import CartPageItem from "@/components/cart/CartPageItem/CartPageItem";

import { usePriceFormatter } from "@/hooks/cart/usePriceFormatter";
import { useCartItems } from "@/hooks/cart/useCartItems";
import { useTranslate } from "@/hooks/app/useTranslate";

import CartPageItemSkeleton from "@/UI/skeletons/CartPageItemSkeleton";
import LoadingSpinner from "@/UI/loaders/LoadingSpinner";

import clearCartIcon from "@/assets/icons/clear-cart-icon.svg?url";
import emptyCartImg from "@/assets/images/empty-cart-img.png";

import "./page.scss";

export default function CartClient() {
  const [isLoading, setIsLoading] = useState(true);
  const [popup, setPopup] = useState<null | {
    type: "auth" | "success";
    orderNumber?: number;
  }>(null);

  const dispatch = useDispatch<AppDispatch>();

  const { items } = useSelector((state: RootState) => state.cart);
  const activated = useSelector((state: RootState) => state.promo.activated);
  const { percentage: tipsPercent } = useSelector(
    (state: RootState) => state.tips,
  );
  const { isAuth, email } = useSelector((state: RootState) => state.user);
  const currency = useSelector((state: RootState) => state.currency.currency);

  const { t, lang } = useTranslate();

  const { getConvertedPrice } = usePriceFormatter();

  const {
    enrichedItems,
    isLoading: cartLoading,
    rawTotal,
    discount,
    hasDiscount,
    discountLabels,
    savedMoney,
    vat,
    baseTotalWithVat,
    discountedTotalWithTips,
  } = useCartItems(items, activated, tipsPercent, lang);

  const { clearCart, checkout, ok } = t.buttons;
  const {
    emptyCart2,
    orderPopupCart,
    orderPopupCart2,
    orderPopupCart3,
    orderPopupCart4,
  } = t.cart;

  const showOverlay = isLoading || cartLoading;

  useEffect(() => {
    if (!cartLoading) {
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartLoading]);

  const onClickClearCart = () => {
    if (items.length > 0) {
      window.confirm(`${clearCart}?`) && dispatch(clearItems());
      dispatch(clearTips());
    }
  };

  const handleCheckout = async () => {
    if (!isAuth || !email) {
      setPopup({ type: "auth" });
      return;
    }

    const tipsAmount = Math.round(discountedTotalWithTips - baseTotalWithVat);

    // Конвертированные суммы для долларов
    const finalTotalUSD = getConvertedPrice({
      price_rub: discountedTotalWithTips,
    }).current;
    const rawTotalUSD = getConvertedPrice({ price_rub: rawTotal }).current;
    // Вычисляем discountedTotal в долларах так же, как в рублях
    const savedMoneyUSD = getConvertedPrice({ price_rub: savedMoney }).current;
    const vatUSD = getConvertedPrice({ price_rub: vat }).current;
    const tipsAmountUSD = getConvertedPrice({ price_rub: tipsAmount }).current;

    const orderItems = enrichedItems.map((item) => {
      const converted = getConvertedPrice({
        price_rub: item.price_rub,
        price_usd: item.price_usd,
      });
      return {
        name_ru: item.name_ru || item.name,
        name_en: item.name_en || item.name,
        price_rub: item.price_rub,
        price_usd: currency === "usd" ? converted.current : item.price_usd,
        count: item.count,
        image: item.image,
      };
    });

    try {
      const res = await fetch("/api/user/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          items: orderItems,
          rawTotal: currency === "rub" ? rawTotal : rawTotalUSD,
          discount,
          savedMoney: currency === "rub" ? savedMoney : savedMoneyUSD,
          vat: currency === "rub" ? vat : vatUSD,
          tips: currency === "rub" ? tipsAmount : tipsAmountUSD,
          tipsPercent: tipsPercent * 100,
          finalTotal:
            currency === "rub" ? discountedTotalWithTips : finalTotalUSD,
          activated,
          lang,
          currency,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        dispatch(clearItems());
        dispatch(clearTips());
        setPopup({ type: "success", orderNumber: data.orderNumber });
      } else {
        console.error("Order Error:", data.error);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleTipChange = (newTip: number) => {
    import("@/store/slices/tipsSlice").then(({ setTips }) => {
      dispatch(setTips(tipsPercent === newTip ? 0 : newTip));
    });
  };

  return (
    <>
      <div
        className={`cart-page-section__list-wrapper ${
          items.length === 0 || (!cartLoading && enrichedItems.length === 0)
            ? "cart-page-section__list-wrapper--empty"
            : ""
        }`}
      >
        <button
          onClick={onClickClearCart}
          className="cart-page-section__clear-cart"
          disabled={items.length === 0}
        >
          <img
            src={clearCartIcon}
            alt="clear-cart-icon"
            width={17}
            height={17}
          />
          {clearCart}
        </button>
        {cartLoading ? (
          <ul className="cart-page-section__list">
            {[...new Array(3)].map((_, index) => (
              <CartPageItemSkeleton key={index} />
            ))}
          </ul>
        ) : enrichedItems.length === 0 ? (
          <>
            <Image
              src={emptyCartImg}
              className="empty-cart-img"
              priority
              alt="empty-cart-img"
              width={495}
              height={233}
              unoptimized
            />
            <p className="empty-cart-text">{emptyCart2}</p>
          </>
        ) : (
          <ul className="cart-page-section__list">
            {enrichedItems.map((item) => (
              <CartPageItem
                key={item.instanceId}
                item={item}
                discount={discount}
                hasDiscount={hasDiscount}
              />
            ))}
          </ul>
        )}
      </div>
      <div className="cart-page-section__right-side">
        <div className="cart-page-section__total-price">
          <CartPageCheck
            enrichedItems={enrichedItems}
            savedDate={useSelector((state: RootState) => state.cart.savedDate)}
            rawTotal={rawTotal}
            discount={discount}
            discountLabels={discountLabels}
            savedMoney={savedMoney}
            vat={vat}
            baseTotalWithVat={baseTotalWithVat}
            selectedTipPercentage={tipsPercent}
            discountedTotalWithTips={discountedTotalWithTips}
            currency={useSelector(
              (state: RootState) => state.currency.currency,
            )}
            onTipChange={handleTipChange}
            isLoading={isLoading}
          />
        </div>
        <button
          className="cart-page-section__pay-btn"
          onClick={handleCheckout}
          disabled={items.length === 0}
        >
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
      {showOverlay && (
        <>
          <div className="overlay-loading" />
          <div className="overlay-spinner">
            <LoadingSpinner />
          </div>
        </>
      )}
    </>
  );
}
