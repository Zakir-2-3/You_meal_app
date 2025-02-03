import { FC } from "react";

import Image from "next/image";

import "./CartSidebarItem.scss";

interface CartSidebarItemProps {
  image: string;
  name_ru: string;
  price_rub: number;
  size: number;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

const CartSidebarItem: FC<CartSidebarItemProps> = ({
  image,
  name_ru,
  price_rub,
  size,
  quantity,
  onIncrease,
  onDecrease
}) => {
  return (
    <li className="cart-sidebar__item">
      <div className="cart-sidebar__item-img">
        <Image src={image} alt={name_ru} width={64} height={64}  />
      </div>
      <div className="cart-sidebar__item-description">
        <h3>{name_ru}</h3>
        <p>{size}г</p>
        <p>{price_rub}₽</p>
      </div>
      <div className="cart-sidebar__item-quantity">
        <button onClick={onDecrease}>-</button>
        <span>{quantity}</span>
        <button onClick={onIncrease}>+</button>
      </div>
    </li>
  );
};

export default CartSidebarItem;
