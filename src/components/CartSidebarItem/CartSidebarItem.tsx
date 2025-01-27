import { FC } from "react";

import Image from "next/image";

import "./CartSidebarItem.scss";

interface CartSidebarItemProps {
  image: string;
  name: { ru: string };
  price_rub: number;
  size: number;
  quantity: number;
}

const CartSidebarItem: FC<CartSidebarItemProps> = ({
  image,
  name,
  price_rub,
  size,
  quantity,
}) => {
  return (
    <li className="cart-sidebar__item">
      <div className="cart-sidebar__item-img">
        <Image src={image} alt={name.ru} width={64} height={52} />
      </div>
      <div className="cart-sidebar__item-description">
        <h3>{name.ru}</h3>
        <p>{size}г</p>
        <p>{price_rub}₽</p>
      </div>
      <div className="cart-sidebar__item-quantity">
        <button>-</button>
        <span>{quantity}</span>
        <button>+</button>
      </div>
    </li>
  );
};

export default CartSidebarItem;
