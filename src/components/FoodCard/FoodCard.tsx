"use client";

import { FC } from "react";

import { useSelector, useDispatch } from "react-redux";
import { addItem } from "@/store/slices/cart.slice";

import Image from "next/image";

import "./FoodCard.scss";

interface FoodCardProps {
  id: number;
  image: string;
  name_ru: string;
  price_rub: number;
  size: number;
  onAddToCart: () => void;
  onRemoveFromCart: () => void;
  isInCart: boolean;
}

const FoodCard: FC<FoodCardProps> = ({
  id,
  image,
  name_ru,
  price_rub,
  size,
  onAddToCart,
  onRemoveFromCart,
  isInCart,
}) => {
  const dispatch = useDispatch();

  const onClickAdd = () => {
    const item = {
      id,
      name_ru,
      price_rub,
      image,
      size,
    };
    dispatch(addItem(item));
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
          className={
            isInCart
              ? "food-section__card-add-btn--delete"
              : "food-section__card-add-btn"
          }
          // onClick={isInCart ? onRemoveFromCart : onAddToCart}
          onClick={onClickAdd}
        >
          {isInCart ? "Удалить" : "Добавить"}
        </button>
      </div>
    </div>
  );
};

export default FoodCard;
