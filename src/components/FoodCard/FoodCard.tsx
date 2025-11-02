"use client";

import { FC, useCallback } from "react";

import Link from "next/link";
import Image from "next/image";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { addItem, removeItem } from "@/store/slices/cartSlice";
import { toggleFavorite } from "@/store/slices/productMetaSlice";

import { LottieIcon } from "../LottieIcon";
import RatingStars from "../RatingStars/RatingStars";

import { getDiscountedPrice } from "@/utils/getDiscountedPrice";

import { useTranslate } from "@/hooks/useTranslate";
import { useExchangeRate } from "@/hooks/useExchangeRate";

import { FoodCardProps } from "@/types/foodCard";

import favoriteAnimation from "@/assets/animations/favorite_animation.json";

import "./FoodCard.scss";

const formatPrice = (val: number, currency: "rub" | "usd") =>
  currency === "rub"
    ? `${Math.round(val)} ₽`
    : `${(Math.round(val * 100) / 100).toFixed(2)} $`;

const FoodCard: FC<FoodCardProps> = ({
  id,
  instanceId,
  image,
  name_ru,
  name_en,
  price_rub,
  price_usd,
  size,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const currency = useSelector((state: RootState) => state.currency.currency);
  const activated = useSelector((state: RootState) => state.promo.activated);
  const { ratings, favorites } = useSelector((s: RootState) => s.productMeta);

  const { rate } = useExchangeRate(1440, currency);

  const { t, lang } = useTranslate();

  const { removeFromCart, addToCart } = t.buttons;
  const { grams } = t.product;
  const { discount10Tr } = t.cart;

  const isPromoFirst10Active = activated.includes("PromoFirst10");
  const iid = instanceId ?? String(id);
  const ratingValue = ratings[iid] ?? 0;
  const isFav = favorites.includes(iid);

  const handleToggleFavorite = useCallback(() => {
    dispatch(toggleFavorite(iid));
  }, [dispatch, iid]);

  const { discount } = getDiscountedPrice(activated, price_rub);
  const discountedPriceRub = Math.round(price_rub * (1 - discount / 100));

  const getPrice = () => {
    if (currency === "rub") {
      return { current: discountedPriceRub, old: price_rub };
    }

    if (rate && rate > 0) {
      return {
        current: discountedPriceRub / rate,
        old: price_rub / rate,
      };
    }

    // fallback если API не работает
    return {
      current: price_usd || 0,
      old: null,
    };
  };

  const prices = getPrice();
  const itemInCart = cartItems.find((i) => i.instanceId === iid);
  const isAdded = (itemInCart?.count ?? 0) > 0;

  const onClickAdd = () => {
    if (isAdded) {
      dispatch(removeItem(iid));
    } else {
      dispatch(
        addItem({
          id,
          instanceId: iid,
          name_ru,
          name_en,
          price_rub,
          price_usd,
          image,
          size,
        })
      );
    }
  };

  return (
    <div className="food-section__card">
      <LottieIcon
        animationData={favoriteAnimation}
        onToggle={handleToggleFavorite}
        trigger="toggleClick"
        size={55}
        hitBoxSize={22}
        activeFav={isFav}
      />
      <Link href={`/product/${iid}`}>
        <div className="food-section__card-img">
          <Image
            src={image}
            alt={lang === "ru" ? name_ru : name_en}
            width={180}
            height={180}
          />
        </div>

        <div className="food-section__card-description">
          <h3 className="food-section__card-name">
            {lang === "ru" ? name_ru : name_en}
          </h3>

          <p className="food-section__card-price">
            {discount > 0 ? (
              <>
                <span className="discounted-price">
                  {formatPrice(prices.current, currency)}
                </span>
                <span className="old-price">
                  {formatPrice(prices.old ?? price_rub, currency)}
                </span>
                {isPromoFirst10Active && (
                  <span className="active-discount" title={discount10Tr}>
                    <i>-</i>10%
                  </span>
                )}
              </>
            ) : (
              formatPrice(prices.current, currency)
            )}
          </p>
        </div>
      </Link>

      <div className="stars-container">
        <RatingStars value={ratingValue} />
      </div>

      <p className="food-section__card-size">
        {size} {grams}
      </p>

      <div className="food-section__card-add">
        <button
          className={`food-section__card-add-btn ${
            isAdded ? "food-section__card-add-btn--delete" : ""
          }`}
          onClick={onClickAdd}
        >
          {isAdded ? removeFromCart : addToCart}
        </button>
      </div>
    </div>
  );
};

export default FoodCard;
