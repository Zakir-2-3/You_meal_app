import { FC } from "react";

import Image from "next/image";

import { AppDispatch } from "@/store/store";
import { useDispatch } from "react-redux";
import { addItem, minusItem } from "@/store/slices/cart.slice";

import { Item } from "@/types/item";

import "./CartSidebarItem.scss";

const CartSidebarItem: FC<Item> = ({
  id,
  name_ru,
  image,
  price_rub,
  size,
  count,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  // Прибавить товар +1
  const onClickPlus = () => {
    dispatch(
      addItem({
        id,
      } as Item)
    );
  };

  // Убавить товар -1
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
        <span style={{ color: count === 99 ? "red" : "inherit" }}>{count}</span>
        <button onClick={onClickPlus}>+</button>
      </div>
    </li>
  );
};

export default CartSidebarItem;
