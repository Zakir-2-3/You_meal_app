import { FC } from "react";

import Image from "next/image";

import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { addItem, minusItem, removeItem } from "@/store/slices/cart.slice";

import CartPageItemSkeleton from "../../ui/skeletons/CartPageItemSkeleton";

import { Item } from "@/types/item";

import "./CartPageItem.scss";

const CartPageItem: FC<Item> = ({
  id,
  name_ru,
  image,
  price_rub,
  size,
  count,
}) => {
  const formattedTotalPrice = new Intl.NumberFormat("ru-RU").format(
    price_rub * (count ?? 0)
  );
  const dispatch = useDispatch<AppDispatch>();

  // Прибавить товар в корзине
  const onClickPlus = () => {
    dispatch(
      addItem({
        id,
      } as Item)
    );
  };

  // Убавить товар в корзине
  const onClickMinus = () => {
    dispatch(minusItem(id));
  };

  // Удалить весь товар, не все товары
  const onClickRemove = () => {
    dispatch(removeItem(id));
  };

  return (
    // <CartPageItemSkeleton/>
    <li className="cart-page-section__item">
      <div className="cart-page-section__img">
        <Image src={image} alt="test" width={100} height={100} />
      </div>
      <div className="cart-page-section__description">
        <h3>{name_ru}</h3>
        <p>{formattedTotalPrice} ₽</p>
        <p>
          {price_rub}₽ <b>{size}г</b>
        </p>
      </div>
      <div className="cart-page-section__item-quantity">
        <button onClick={onClickMinus}>-</button>
        <span>{count}</span>
        <button onClick={onClickPlus}>+</button>
      </div>
      <div className="cart-page-section__remove-item">
        <button onClick={onClickRemove}>X</button>
      </div>
    </li>
  );
};

export default CartPageItem;
