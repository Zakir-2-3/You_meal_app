import { FC } from "react";

import CartSidebarItem from "../CartSidebarItem/CartSidebarItem";

import Image from "next/image";

import "./CartSidebar.scss";

import deliveryIcon from "@/assets/icons/delivery-icon.png";

interface CartSidebarProps {
  cartItems: {
    id: string;
    image: string;
    name: { ru: string };
    price_rub: number;
    size: number;
    quantity: number;
  }[];
}

const CartSidebar: FC<CartSidebarProps> = ({ cartItems }) => {
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price_rub * item.quantity,
    0
  );

  return (
    <aside className="cart-sidebar">
      <div className="cart-sidebar__total-orders">
        <h2>Корзина</h2>
        <span>{totalQuantity}</span>
      </div>
      <div className="cart-sidebar__description-orders">
        <ul className="cart-sidebar__list">
          {cartItems.length === 0 ? (
            <li className="cart-sidebar__item cart-sidebar__item--empty">Пустая корзина :(</li>
          ) : (
            cartItems.map((item) => <CartSidebarItem key={item.id} {...item} />)
          )}
        </ul>
      </div>
      <div className="cart-sidebar__total-price">
        <p>Итого:</p>
        <span>{totalPrice}₽</span>
      </div>
      <div className="cart-sidebar__place-order">
        <button>Оформить заказ</button>
      </div>
      <div className="cart-sidebar__delivery">
        <Image src={deliveryIcon} alt="delivery-icon" />
        <p>Бесплатная доставка*</p>
      </div>
    </aside>
  );
};

export default CartSidebar;
