import { FC } from "react";

import Image from "next/image";
import Link from "next/link";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

import CartSidebarItem from "./CartSidebarItem/CartSidebarItem";

import CartSidebarItemSkeleton from "../../ui/skeletons/CartSidebarItemSkeleton";

import deliveryIcon from "@/assets/icons/delivery-icon.svg";

import "./CartSidebar.scss";

interface CartSidebarProps {
  isLoading: boolean;
}

const CartSidebar: FC<CartSidebarProps> = ({ isLoading }) => {
  // Получаем массив данных и общую сумму
  const { items, totalPrice } = useSelector((state: RootState) => state.cart);

  // Считаем кол-во товаров для ограничения в 99 штук
  const totalCount = items.reduce((sum, item) => sum + (item.count ?? 0), 0);
  // Форматирует цену
  const formattedTotalPrice = new Intl.NumberFormat("ru-RU").format(totalPrice);

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
        <span>{formattedTotalPrice} ₽</span>
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
