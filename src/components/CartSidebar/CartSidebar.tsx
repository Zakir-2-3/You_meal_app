import { FC } from "react";

import CartSidebarItem from "./CartSidebarItem/CartSidebarItem";

import Image from "next/image";
import Link from "next/link";

import CartSidebarItemSkeleton from "../ui/skeletons/CartSidebarItemSkeleton";

import "./CartSidebar.scss";

import deliveryIcon from "@/assets/icons/delivery-icon.svg";

interface CartSidebarProps {
  cartItems: {
    id: string;
    image: string;
    name: { ru: string };
    price_rub: number;
    size: number;
    quantity: number;
  }[];
  setCartItems: React.Dispatch<
    React.SetStateAction<CartSidebarProps["cartItems"]>
  >;
  isLoading: boolean;
}

const CartSidebar: FC<CartSidebarProps> = ({
  cartItems,
  setCartItems,
  isLoading,
}) => {
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price_rub * item.quantity,
    0
  );
  const formattedTotalPrice = new Intl.NumberFormat("ru-RU").format(totalPrice);

  const handleIncrease = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrease = (id: string) => {
    setCartItems(
      (prev) =>
        prev
          .map((item) =>
            item.id === id ? { ...item, quantity: item.quantity - 1 } : item
          )
          .filter((item) => item.quantity > 0) // Удаляем товар, если quantity становится 0
    );
  };

  return (
    <aside className="cart-sidebar">
      <div className="cart-sidebar__total-orders">
        <h2>Корзина</h2>
        <span>{totalQuantity}</span>
      </div>
      <div className="cart-sidebar__description-orders">
        <ul className="cart-sidebar__list">
          {isLoading ? (
            [...new Array(3)].map((_, index) => (
              <CartSidebarItemSkeleton key={index} />
            ))
          ) : cartItems.length === 0 ? (
            <li className="cart-sidebar__item cart-sidebar__item--empty">
              Пустая корзина :(
            </li>
          ) : (
            cartItems.map((item) => (
              <CartSidebarItem
                key={item.id}
                {...item}
                onIncrease={() => handleIncrease(item.id)}
                onDecrease={() => handleDecrease(item.id)}
              />
            ))
          )}
        </ul>
      </div>
      <div className="cart-sidebar__total-price">
        <p>Итого:</p>
        <span>{formattedTotalPrice}₽</span>
      </div>
      <div className="cart-sidebar__place-order">
        <Link href='/cart'>
        Оформить заказ
        </Link>
      </div>
      <div className="cart-sidebar__delivery">
        <Link href="/delivery" className="cart-sidebar__delivery-link">
          <Image src={deliveryIcon} alt="delivery-icon" width={24} height={24}/>
          Бесплатная доставка*
        </Link>
      </div>
    </aside>
  );
};

export default CartSidebar;
