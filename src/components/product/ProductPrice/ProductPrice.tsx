"use client";

import { ProductPriceProps } from "@/types/components/product/product-price";

const ProductPrice = ({
  formattedCurrent,
  formattedOld,
  hasDiscount,
  priceLabel,
}: ProductPriceProps) => {
  return (
    <div className="product-section__info-price">
      <p>{priceLabel}</p>
      <p>
        {hasDiscount ? (
          <>
            <span className="old-price">{formattedOld}</span>
            <span className="discounted-price">{formattedCurrent}</span>
          </>
        ) : (
          formattedCurrent
        )}
      </p>
    </div>
  );
};

export default ProductPrice;
