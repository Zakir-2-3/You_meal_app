"use client";

import { FC } from "react";

import Image from "next/image";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { addItem, removeItem } from "@/store/slices/cart.slice";

import { FoodCardProps } from "@/types/foodCard";

import "./FoodCard.scss";

const FoodCard: FC<FoodCardProps> = ({
  id,
  image,
  name_ru,
  price_rub,
  size,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  // Проверяем, есть ли этот товар в корзине
  const itemInCart = cartItems.find((item) => item.id === id);
  const isAdded = itemInCart && (itemInCart.count ?? 0) > 0;

  // Кнопка добавить/удалить товар в main
  const onClickAdd = () => {
    if (isAdded) {
      dispatch(removeItem(id)); // Удаляем товар, если он уже в корзине
    } else {
      const item = {
        id,
        name_ru,
        price_rub,
        image,
        size,
      };
      dispatch(addItem(item));
    }
  };

  return (
    <div className="food-section__card">
      <div className="food-section__card-img">
        <Image src={image} alt={name_ru} width={220} height={212} />
      </div>
      <div className="food-section__card-description">
        <h3>{price_rub}₽</h3>
        <p>{name_ru}</p>
        <p>{size} г</p>
      </div>
      <div className="food-section__card-add">
        <button
          className={`food-section__card-add-btn ${
            isAdded ? "food-section__card-add-btn--delete" : ""
          }`}
          onClick={onClickAdd}
        >
          {isAdded ? "Удалить" : "Добавить"}
        </button>
      </div>
    </div>
  );
};

export default FoodCard;
