"use client";

import React, { FC, useCallback, useState, useRef } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { addItem, removeItem } from "@/store/slices/cartSlice";
import { toggleFavorite } from "@/store/slices/productMetaSlice";

import RatingStars from "../RatingStars/RatingStars";
import { LottieIcon } from "@/components/ui/LottieIcon";
import ProductImageCarousel from "../ProductImageCarousel/ProductImageCarousel";

import { useTranslate } from "@/hooks/app/useTranslate";
import { usePriceFormatter } from "@/hooks/cart/usePriceFormatter";

import { getDiscountedPrice } from "@/utils/cart/getDiscountedPrice";

import { ExtendedFoodCardProps } from "@/types/product/food-card";

import favoriteAnimation from "@/assets/animations/favorite_animation.json";

import "./FoodCard.scss";

const FoodCard: FC<ExtendedFoodCardProps> = ({
  id,
  instanceId,
  image,
  name_ru,
  name_en,
  price_rub,
  price_usd,
  size,
  isFavoritesMode,
  onRemoveFromFavorites,
  isProductNavigating,
  onNavigate,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [removing, setRemoving] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);
  const pathname = usePathname();

  const dispatch = useDispatch<AppDispatch>();

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const activated = useSelector((state: RootState) => state.promo.activated);
  const { ratings, favorites } = useSelector(
    (state: RootState) => state.productMeta,
  );
  const isUserDataLoaded = useSelector(
    (state: RootState) => state.user.isUserDataLoaded,
  );

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

  const itemInCart = cartItems.find((i) => i.instanceId === iid);
  const isAdded = isUserDataLoaded && (itemInCart?.count ?? 0) > 0;

  const onClickAdd = () => {
    if (isAdded) {
      dispatch(removeItem(iid));
    } else {
      dispatch(addItem({ id: String(id), instanceId: iid }));
    }
  };

  const handleToggleFavorite = useCallback(() => {
    if (isFavoritesMode && isFav && !isAnimating.current && cardRef.current) {
      const element = cardRef.current;
      isAnimating.current = true;

      // 1. Запускаем программную анимацию opacity и scale
      const duration = 300;
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        element.style.opacity = String(1 - ease);
        element.style.transform = `scale(${1 - ease})`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Программная анимация завершена – можно схлопнуть высоту
          setRemoving(true);
          // Удаляем из Redux
          dispatch(toggleFavorite(iid));
        }
      };

      requestAnimationFrame(animate);
    } else {
      dispatch(toggleFavorite(iid));
    }
  }, [dispatch, iid, isFavoritesMode, isFav]);

  // После завершения CSS-анимации высоты уведомляем родителя
  const handleTransitionEnd = (e: React.TransitionEvent) => {
    if (removing && e.target === e.currentTarget && onRemoveFromFavorites) {
      onRemoveFromFavorites(iid);
    }
  };

  const handleProductClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Если уже на странице этого товара или идёт навигация — отменяем
    if (pathname === `/product/${iid}` || isProductNavigating) {
      e.preventDefault();
      return;
    }
    onNavigate?.();
  };

  return (
    <div
      ref={cardRef}
      className={`food-section__card ${removing ? "removing" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTransitionEnd={handleTransitionEnd}
    >
      <LottieIcon
        animationData={favoriteAnimation}
        onToggle={handleToggleFavorite}
        trigger="toggleClick"
        size={65}
        hitBoxSize={28}
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
        <Link
          href={`/product/${iid}`}
          onClick={handleProductClick}
          style={{
            pointerEvents:
              pathname === `/product/${iid}` || isProductNavigating
                ? "none"
                : "auto",
            opacity:
              pathname === `/product/${iid}` || isProductNavigating ? 0.6 : 1,
          }}
        >
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

      <Link
        href={`/product/${iid}`}
        className="food-section__card-link"
        onClick={handleProductClick}
        style={{
          pointerEvents:
            pathname === `/product/${iid}` || isProductNavigating
              ? "none"
              : "auto",
          opacity:
            pathname === `/product/${iid}` || isProductNavigating ? 0.6 : 1,
        }}
      >
        <RatingStars value={ratingValue} />
      </Link>

      <p className="food-section__card-size">
        {size}
        {grams}
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

export default React.memo(FoodCard);
