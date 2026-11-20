"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

import DeliveryLink from "@/components/layout/DeliveryLink/DeliveryLink";
import CartSidebarItem from "../CartSidebarItem/CartSidebarItem";

import { useTranslate } from "@/hooks/app/useTranslate";
import { useCartItems } from "@/hooks/cart/useCartItems";
import { usePriceFormatter } from "@/hooks/cart/usePriceFormatter";

import CartSidebarItemSkeleton from "@/UI/skeletons/CartSidebarItemSkeleton";

import "./CartSidebar.scss";

const CartSidebar = () => {
  const [isCartNavigating, setIsCartNavigating] = useState(false);

  const pathname = usePathname();

  // Сброс блокировки при смене пути
  useEffect(() => {
    setIsCartNavigating(false);
  }, [pathname]);

  // Таймаут подстраховки
  useEffect(() => {
    if (isCartNavigating) {
      const timer = setTimeout(() => setIsCartNavigating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCartNavigating]);

  const { items } = useSelector((state: RootState) => state.cart);
  const activated = useSelector((state: RootState) => state.promo.activated);
  const tipsPercent = useSelector((state: RootState) => state.tips.percentage);

  const isHydrated = useSelector((state: RootState) => state.user.isHydrated);
  const { status: sessionStatus } = useSession();
  const isUserDataLoaded = useSelector(
    (state: RootState) => state.user.isUserDataLoaded,
  );

  const { t, lang: currentLang } = useTranslate();
  const { getConvertedPrice } = usePriceFormatter();

  const {
    enrichedItems,
    isLoading: cartLoading,
    rawTotal,
    rawTotalUSD,
    savedMoney,
    savedMoneyUSD,
  } = useCartItems(items, activated, tipsPercent, currentLang);

  // Если данные пользователя ещё загружаются, считаем корзину пустой
  const effectiveItems = !isUserDataLoaded ? [] : enrichedItems;

  const showSkeletons =
    !isHydrated ||
    sessionStatus === "loading" ||
    !isUserDataLoaded ||
    cartLoading;

  // Итоговая сумма без учёта НДС и чаевых
  const discountedTotal = rawTotal - savedMoney;
  const discountedTotalUSD = rawTotalUSD - savedMoneyUSD;

  const rawTotalFormatted = getConvertedPrice({
    price_rub: rawTotal,
    price_usd: rawTotalUSD,
  });
  const discountedTotalFormatted = getConvertedPrice({
    price_rub: discountedTotal,
    price_usd: discountedTotalUSD,
  });

  const { checkout } = t.buttons;
  const { title, emptyCart, total2 } = t.cart;

  const totalCount = effectiveItems.reduce(
    (sum, item) => sum + (item.count ?? 0),
    0,
  );

  // Вычисляем количество скелетонов (0 товаров -> 1, 1-2 -> столько же, >=3 -> 3)
  let skeletonCount = 1;
  if (showSkeletons) {
    const preLoginCount = sessionStorage.getItem("preLoginCartCount");
    if (preLoginCount !== null) {
      skeletonCount = Math.min(Math.max(parseInt(preLoginCount, 10), 1), 3);
    } else {
      skeletonCount = Math.min(Math.max(items.length, 1), 3);
    }
  }

  const handleCheckoutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Если корзина пуста – отменяем
    if (effectiveItems.length === 0) {
      e.preventDefault();
      return;
    }
    // Уже на странице корзины или идёт навигация – блокируем
    if (pathname === "/cart" || isCartNavigating) {
      e.preventDefault();
      return;
    }
    setIsCartNavigating(true);
  };

  return (
    <aside className="cart-sidebar">
      <div className="cart-sidebar__total-orders">
        <h2 className="cart-sidebar__title">{title}</h2>
        <span style={{ color: totalCount === 99 ? "red" : "inherit" }}>
          {totalCount}
        </span>
      </div>

      <div
        className={`cart-sidebar__description-orders ${effectiveItems.length >= 3 ? "cart-sidebar__description-orders--has-scroll" : ""}`}
      >
        <ul className="cart-sidebar__list">
          {showSkeletons ? (
            [...new Array(skeletonCount)].map((_, index) => (
              <CartSidebarItemSkeleton key={index} />
            ))
          ) : !cartLoading && effectiveItems.length === 0 ? (
            <li className="cart-sidebar__item cart-sidebar__item--empty">
              {emptyCart}
            </li>
          ) : (
            effectiveItems.map((item, index) => (
              <CartSidebarItem
                key={item.instanceId}
                item={item}
                style={
                  {
                    "--animation-delay": `${index * 0.05}s`,
                  } as React.CSSProperties
                }
              />
            ))
          )}
        </ul>
      </div>

      <div className="cart-sidebar__total-price">
        <p>{total2}</p>
        <div className="cart-sidebar__total-price-wrapper">
          {effectiveItems.length > 0 && rawTotal !== discountedTotal && (
            <span
              className="old-price"
              title={activated
                .map((code) => (t.user as any)[code] || code)
                .join(", ")}
            >
              {rawTotalFormatted.formattedCurrent}
            </span>
          )}
          <span
            className={
              effectiveItems.length > 0 && rawTotal !== discountedTotal
                ? "discounted-price"
                : "no-discount"
            }
          >
            {discountedTotalFormatted.formattedCurrent}
          </span>
        </div>
      </div>

      <div className="cart-sidebar__place-order">
        <Link
          href="/cart"
          className={effectiveItems.length === 0 ? "disabled" : ""}
          aria-disabled={effectiveItems.length === 0}
          onClick={handleCheckoutClick}
        >
          {checkout}
        </Link>
      </div>

      <div className="cart-sidebar__delivery">
        <DeliveryLink className="cart-sidebar__delivery-link" />
      </div>
    </aside>
  );
};

export default CartSidebar;
