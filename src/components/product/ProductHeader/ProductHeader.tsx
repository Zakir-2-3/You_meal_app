"use client";

import ProductPrice from "../ProductPrice/ProductPrice";
import RatingStars from "@/components/product/RatingStars/RatingStars";

import { ProductHeaderProps } from "@/types/product/product-header";

const ProductHeader = ({
  product,
  prices,
  ratingValue,
  lang,
  translations,
  onRatingChange,
}: ProductHeaderProps) => {
  return (
    <>
      <h1 className="product-section__title">
        {lang === "ru" ? product.name_ru : product.name_en}
      </h1>

      <ProductPrice
        formattedCurrent={prices.formattedCurrent}
        formattedOld={prices.formattedOld}
        hasDiscount={prices.hasDiscount}
        priceLabel={translations.price}
      />

      <div className="product-section__info-rating">
        <RatingStars
          value={ratingValue}
          onChange={(value) => {
            if (value !== ratingValue) {
              onRatingChange(value);
            }
          }}
        />
      </div>
    </>
  );
};

export default ProductHeader;
