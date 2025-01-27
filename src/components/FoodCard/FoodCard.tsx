import { FC } from "react";

import Image from "next/image";

import "./FoodCard.scss";

interface FoodCardProps {
  image: string;
  name: string;
  price_rub: number;
  price_usd: number;
  size: number;
  onAddToCart: () => void;
}

const FoodCard: FC<FoodCardProps> = ({
  image,
  name,
  price_rub,
  price_usd,
  size,
  onAddToCart,
}) => {
  return (
    <div className="food-section__card">
      <div className="food-section__card-img">
        <Image src={image} alt={name.ru} width={276} height={220} />
      </div>
      <div className="food-section__card-description">
        <h3>{price_rub}₽</h3>
        <p>{name.ru}</p>
        <p>{size} г</p>
      </div>
      <div className="food-section__card-add">
        <button className="food-section__card-add-btn" onClick={onAddToCart}>Добавить</button>
      </div>
    </div>
  );
};

export default FoodCard;
