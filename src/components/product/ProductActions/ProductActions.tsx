"use client";

import QuantityControl from "@/components/product/QuantityControl/QuantityControl";

import { ProductActionsProps } from "@/types/product/product-actions";

const ProductActions = ({
  count,
  isAdded,
  onClickPlus,
  onClickMinus,
  onClickAdd,
  translations,
}: ProductActionsProps) => {
  return (
    <div className="product-section__add-cart">
      <QuantityControl
        count={count}
        onClickPlus={onClickPlus}
        onClickMinus={onClickMinus}
      />
      <button className="product-section__add-cart-btn" onClick={onClickAdd}>
        {isAdded ? translations.removeFromCart : translations.addToCart}
      </button>
    </div>
  );
};

export default ProductActions;
