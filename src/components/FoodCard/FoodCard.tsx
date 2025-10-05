"use client";

import { FC, useCallback } from "react";

import Link from "next/link";
import Image from "next/image";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { addItem, removeItem } from "@/store/slices/cartSlice";
import { setRating, toggleFavorite } from "@/store/slices/productMetaSlice";

import FavoriteButton from "../FavoriteButton/FavoriteButton";
import RatingStars from "../RatingStars/RatingStars";

import { getDiscountedPrice } from "@/utils/getDiscountedPrice";

import { FoodCardProps } from "@/types/foodCard";

import "./FoodCard.scss";

const FoodCard: FC<FoodCardProps> = ({
  id,
  instanceId,
  image,
  name_ru,
  price_rub,
  size,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const activated = useSelector((state: RootState) => state.promo.activated);
  const { ratings, favorites } = useSelector((s: RootState) => s.productMeta);
  const { isAuth } = useSelector((s: RootState) => s.user);

  const isPromoFirst10Active = activated.includes("PromoFirst10");

  const iid = instanceId ?? String(id);

  const ratingValue = ratings[iid] ?? 0;
  const isFav = favorites.includes(iid);

  const handleToggleFavorite = useCallback(() => {
    dispatch(toggleFavorite(iid));
  }, [dispatch, iid]);

  const handleRatingChange = useCallback(
    (value: number) => {
      dispatch(setRating({ id: iid, value }));
    },
    [dispatch, iid]
  );

  const { discount } = getDiscountedPrice(activated, price_rub);
  const hasFirstOrderDiscount = activated.includes("PromoFirst10");
  const discountedPrice = Math.round(price_rub * (1 - discount / 100));

  const itemInCart = cartItems.find((item) => item.instanceId === iid);
  const isAdded = (itemInCart?.count ?? 0) > 0;

  const onClickAdd = () => {
    if (isAdded) {
      dispatch(removeItem(iid));
    } else {
      const item = {
        id,
        instanceId: iid,
        name_ru,
        price_rub,
        image,
        size,
      };
      dispatch(addItem(item));
    }
  };

  return (
    <div className="food-section__card" style={{ position: "relative" }}>
      <FavoriteButton active={isFav} onToggle={handleToggleFavorite} />
      <Link href={`/product/${iid}`}>
        <div className="food-section__card-img">
          <Image src={image} alt={name_ru} width={180} height={180} />
        </div>
        <div className="food-section__card-description">
          <p className="food-section__card-name">{name_ru}</p>
          <h3 className="food-section__card-price">
            {hasFirstOrderDiscount ? (
              <>
                <span className="discounted-price">{discountedPrice}₽</span>
                <span className="old-price">{price_rub}₽</span>
                {isPromoFirst10Active && (
                  <span className="active-discount" title="Скидка 10%">
                    <i>-</i>10%
                  </span>
                )}
              </>
            ) : (
              `${price_rub}₽`
            )}
          </h3>
        </div>
      </Link>
      <div className="stars-container">
        <RatingStars value={ratingValue} />
      </div>
      <p className="food-section__card-size">{size} г.</p>
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
