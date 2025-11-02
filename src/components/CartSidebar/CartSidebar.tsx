import { FC, useState } from "react";

import Link from "next/link";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

import { LottieIcon } from "../LottieIcon";
import CartSidebarItem from "./CartSidebarItem/CartSidebarItem";

import { getDiscountedPrice } from "@/utils/getDiscountedPrice";

import { useTranslate } from "@/hooks/useTranslate";

import CartSidebarItemSkeleton from "@/ui/skeletons/CartSidebarItemSkeleton";

import deliveryAnimation from "@/assets/animations/delivery_animation.json";

import "./CartSidebar.scss";

interface CartSidebarProps {
  isLoading: boolean;
}

const CartSidebar: FC<CartSidebarProps> = ({ isLoading }) => {
  const [hovered, setHovered] = useState(false);

  const { items } = useSelector((state: RootState) => state.cart);
  const activated = useSelector((state: RootState) => state.promo.activated);

  const { t } = useTranslate();

  const { title, emptyCart, total2, discount2Tr } = t.cart;
  const { checkout } = t.buttons;
  const { freeShipping, freeShipping2 } = t.deliveryPage;

  const totalCount = items.reduce((sum, item) => sum + (item.count ?? 0), 0);

  // Общая сумма без скидок
  const rawTotal = items.reduce((sum, item) => {
    return sum + item.price_rub * (item.count ?? 0);
  }, 0);

  // Фильтрация промокодов
  const effectivePromos = [...activated];
  if (effectivePromos.includes("PromoFrom2020") && rawTotal < 2000) {
    const index = effectivePromos.indexOf("PromoFrom2020");
    effectivePromos.splice(index, 1);
  }

  // Финальная сумма со скидкой (общая скидка на всю корзину)
  const { discount } = getDiscountedPrice(effectivePromos, rawTotal);
  const discountedTotal = rawTotal * (1 - discount / 100);

  // Форматирование цен
  const formattedRawTotalPrice = new Intl.NumberFormat("ru-RU").format(
    rawTotal
  );
  const formattedDiscountedTotalPrice = Math.round(discountedTotal).toString();

  return (
    <aside className="cart-sidebar">
      <div className="cart-sidebar__total-orders">
        <h2 className="cart-sidebar__title">{title}</h2>
        <span style={{ color: totalCount === 99 ? "red" : "inherit" }}>
          {totalCount}
        </span>
      </div>

      <div className="cart-sidebar__description-orders">
        <ul className="cart-sidebar__list">
          {isLoading ? (
            [...new Array(3)].map((_, index) => (
              <CartSidebarItemSkeleton key={index} />
            ))
          ) : items.length === 0 ? (
            <li className="cart-sidebar__item cart-sidebar__item--empty">
              {emptyCart}
            </li>
          ) : (
            items.map((item) => (
              <CartSidebarItem key={item.instanceId} {...item} />
            ))
          )}
        </ul>
      </div>

      <div className="cart-sidebar__total-price">
        <p>{total2}</p>

        <div className="cart-sidebar__total-price-wrapper">
          {items.length > 0 && rawTotal !== discountedTotal && (
            <span
              className="old-price"
              title={`${discount2Tr} ${activated.join(", ")}`}
            >
              {formattedRawTotalPrice}₽
            </span>
          )}
          <span
            className={
              activated.length > 0 &&
              items.length > 0 &&
              rawTotal !== discountedTotal
                ? "discounted-price"
                : "no-discount"
            }
          >
            {formattedDiscountedTotalPrice}₽
          </span>
        </div>
      </div>

      <div className="cart-sidebar__place-order">
        <Link href="/cart">{checkout}</Link>
      </div>

      <div className="cart-sidebar__delivery">
        <Link
          href="/delivery"
          className="cart-sidebar__delivery-link"
          title={freeShipping2}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <LottieIcon
            animationData={deliveryAnimation}
            trigger="hover+load"
            size={32}
            isHovered={hovered}
          />
          {freeShipping}
        </Link>
      </div>
    </aside>
  );
};

export default CartSidebar;
