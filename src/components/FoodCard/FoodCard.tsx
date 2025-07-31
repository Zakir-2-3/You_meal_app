"use client";

import { FC } from "react";
import Image from "next/image";
import Link from "next/link";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { addItem, removeItem } from "@/store/slices/cartSlice";

import { getDiscountedPrice } from "@/utils/getDiscountedPrice";

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

  const activated = useSelector((state: RootState) => state.promo.activated);

  const { discount } = getDiscountedPrice(activated, price_rub);
  const hasFirstOrderDiscount = activated.includes("PromoFirst10");
  const discountedPrice = Math.round(price_rub * (1 - discount / 100));

  // Проверяем, есть ли этот товар в корзине
  const itemInCart = cartItems.find((item) => item.id === id);
  const isAdded = itemInCart && (itemInCart.count ?? 0) > 0;

  // Кнопка добавить/удалить товар в main
  const onClickAdd = () => {
    if (isAdded) {
      dispatch(removeItem(id)); // Удаляем товар
    } else {
      const item = {
        id,
        name_ru,
        price_rub,
        image,
        size,
      };
      dispatch(addItem(item)); // Добавляем товар
    }
  };

  return (
    <div className="food-section__card">
      <Link href={`/product/${id}`}>
        <div className="food-section__card-img">
          <Image src={image} alt={name_ru} width={220} height={212} />
        </div>
        <div className="food-section__card-description">
          <h3>
            {hasFirstOrderDiscount ? (
              <>
                <span className="old-price">{price_rub}₽</span>
                <span className="discounted-price">{discountedPrice}₽</span>
              </>
            ) : (
              `${price_rub}₽`
            )}
          </h3>
          <p>{name_ru}</p>
          <p>{size} г</p>
        </div>
      </Link>
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
