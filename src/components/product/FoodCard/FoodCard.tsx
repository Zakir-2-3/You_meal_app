"use client";

import { FC, useCallback, useState } from "react";

import Link from "next/link";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { addItem, removeItem } from "@/store/slices/cartSlice";
import { toggleFavorite } from "@/store/slices/productMetaSlice";

import RatingStars from "../RatingStars/RatingStars";
import { LottieIcon } from "@/components/ui/LottieIcon";
import ProductImageCarousel from "../ProductImageCarousel/ProductImageCarousel";

import { getDiscountedPrice } from "@/utils/cart/getDiscountedPrice";

import { useTranslate } from "@/hooks/app/useTranslate";
import { usePriceFormatter } from "@/hooks/cart/usePriceFormatter";

import { FoodCardProps } from "@/types/product/food-card";

import favoriteAnimation from "@/assets/animations/favorite_animation.json";

import "./FoodCard.scss";

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
  const [isHovered, setIsHovered] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const activated = useSelector((state: RootState) => state.promo.activated);
  const { ratings, favorites } = useSelector((s: RootState) => s.productMeta);

  const { getConvertedPrice } = usePriceFormatter();
  const { t, lang } = useTranslate();

  const { removeFromCart, addToCart } = t.buttons;
  const { grams } = t.product;
  const { discount10Tr } = t.cart;

  const isPromoFirst10Active = activated.includes("PromoFirst10");
  const iid = instanceId ?? String(id);
  const ratingValue = ratings[iid] ?? 0;
  const isFav = favorites.includes(iid);

  const { discount } = getDiscountedPrice(activated, price_rub);
  const prices = getConvertedPrice({ price_rub, price_usd }, discount);

  const handleToggleFavorite = useCallback(() => {
    dispatch(toggleFavorite(iid));
  }, [dispatch, iid]);

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
        }),
      );
    }
  };

  return (
    <div
      className="food-section__card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <LottieIcon
        animationData={favoriteAnimation}
        onToggle={handleToggleFavorite}
        trigger="toggleClick"
        size={59}
        hitBoxSize={26}
        activeFav={isFav}
      />
      <div className="food-section__card-img">
        <ProductImageCarousel
          images={[image, image, image, image]}
          alt={lang === "ru" ? name_ru : name_en}
          showControls={isHovered}
        />
      </div>

      <div className="food-section__card-description">
        <Link href={`/product/${iid}`}>
          <h3 className="food-section__card-name">
            {lang === "ru" ? name_ru : name_en}
          </h3>
        </Link>

        <p className="food-section__card-price">
          {prices.hasDiscount ? (
            <>
              <span className="old-price">{prices.formattedOld}</span>
              <span className="discounted-price">
                {prices.formattedCurrent}
              </span>
              {isPromoFirst10Active && (
                <span className="active-discount" title={discount10Tr}>
                  <i>-</i>10%
                </span>
              )}
            </>
          ) : (
            prices.formattedCurrent
          )}
        </p>
      </div>

      <Link href={`/product/${iid}`} className="food-section__card-link">
        <RatingStars value={ratingValue} />
      </Link>

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
