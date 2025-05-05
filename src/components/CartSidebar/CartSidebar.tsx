import { FC } from "react";

import Image from "next/image";
import Link from "next/link";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

import CartSidebarItem from "./CartSidebarItem/CartSidebarItem";

import { getDiscountedPrice } from "@/utils/getDiscountedPrice";

import CartSidebarItemSkeleton from "@/ui/skeletons/CartSidebarItemSkeleton";

import deliveryIcon from "@/assets/icons/delivery-icon.svg";

import "./CartSidebar.scss";

interface CartSidebarProps {
  isLoading: boolean;
}

const CartSidebar: FC<CartSidebarProps> = ({ isLoading }) => {
  const { items } = useSelector((state: RootState) => state.cart);
  const activated = useSelector((state: RootState) => state.promo.activated);

  const totalCount = items.reduce((sum, item) => sum + (item.count ?? 0), 0);

  // Общая сумма без скидок
  const rawTotal = items.reduce((sum, item) => {
    return sum + item.price_rub * (item.count ?? 0);
  }, 0);

  // Фильтрация промокодов с учётом условий (пример: PromoFrom2020 действует только от 2000₽)
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
        <h2>Корзина</h2>
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
              Пустая корзина :(
            </li>
          ) : (
            items.map((item) => <CartSidebarItem key={item.id} {...item} />)
          )}
        </ul>
      </div>

      <div className="cart-sidebar__total-price">
        <p>Итого:</p>
        <div className="cart-sidebar__total-price-wrapper">
          {items.length > 0 && rawTotal !== discountedTotal && (
            <span className="old-price">{formattedRawTotalPrice} ₽</span>
          )}
          <span
            className={`discounted-price ${
              activated.length === 0 || items.length === 0 ? "no-discount" : ""
            }`}
          >
            {formattedDiscountedTotalPrice} ₽
          </span>
        </div>
      </div>

      <div className="cart-sidebar__place-order">
        <Link href="/cart">Оформить заказ</Link>
      </div>

      <div className="cart-sidebar__delivery">
        <Link href="/delivery" className="cart-sidebar__delivery-link">
          <Image
            src={deliveryIcon}
            alt="delivery-icon"
            width={24}
            height={24}
          />
          Бесплатная доставка*
        </Link>
      </div>
    </aside>
  );
};

export default CartSidebar;
