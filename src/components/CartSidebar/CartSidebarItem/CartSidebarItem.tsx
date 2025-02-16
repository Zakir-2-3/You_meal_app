import { FC } from "react";

import { useDispatch } from "react-redux";

import { addItem, minusItem } from "@/store/slices/cart.slice";

import Image from "next/image";

import "./CartSidebarItem.scss";

interface CartSidebarItemProps {
  id: number;
  image: string;
  name_ru: string;
  price_rub: number;
  size: number;
  count: number;
}

const CartSidebarItem: FC<CartSidebarItemProps> = ({
  id,
  name_ru,
  image,
  price_rub,
  size,
  count,
}) => {
  const dispatch = useDispatch();

  const onClickPlus = () => {
    dispatch(
      addItem({
        id,
      })
    );
  };

  const onClickMinus = () => {
    dispatch(minusItem(id));
  };

  return (
    <li className="cart-sidebar__item">
      <div className="cart-sidebar__item-img">
        <Image src={image} alt={name_ru} width={64} height={64} />
      </div>
      <div className="cart-sidebar__item-description">
        <h3>{name_ru}</h3>
        <p>{size}г</p>
        <p>{price_rub}₽</p>
      </div>
      <div className="cart-sidebar__item-quantity">
        <button onClick={onClickMinus}>-</button>
        <span>{count}</span>
        <button onClick={onClickPlus}>+</button>
      </div>
    </li>
  );
};

export default CartSidebarItem;
