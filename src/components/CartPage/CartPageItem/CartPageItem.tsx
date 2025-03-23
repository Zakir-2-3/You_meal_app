import { FC } from "react";

import Image from "next/image";

import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { addItem, minusItem, removeItem } from "@/store/slices/cartSlice";

import QuantityControl from "@/components/QuantityControl/QuantityControl";

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

  // Удалить весь товар
  const onClickRemove = () => {
    dispatch(removeItem(id));
  };

  return (
    <li className="cart-page-section__item">
      <div className="cart-page-section__img">
        <Image src={image} alt={name_ru} width={100} height={100} />
      </div>
      <div className="cart-page-section__description">
        <h3>{name_ru}</h3>
        <p>{formattedTotalPrice} ₽</p>
        <p>
          {price_rub}₽ <b>{size}г</b>
        </p>
      </div>
      <QuantityControl
        count={count}
        onClickPlus={onClickPlus}
        onClickMinus={onClickMinus}
      />
      <div className="cart-page-section__remove-item">
        <button onClick={onClickRemove}>X</button>
      </div>
    </li>
  );
};

export default CartPageItem;
