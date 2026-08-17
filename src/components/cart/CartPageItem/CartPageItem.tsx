"use client";

import Image from "next/image";
import Link from "next/link";

import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { addItem, minusItem, removeItem } from "@/store/slices/cartSlice";

import QuantityControl from "@/components/product/QuantityControl/QuantityControl";

import CloseButton from "@/UI/buttons/CloseButton/CloseButton";

import { useTranslate } from "@/hooks/app/useTranslate";
import { usePriceFormatter } from "@/hooks/cart/usePriceFormatter";

import { CartPageItemProps } from "@/types/components/product/cart-page";

import "./CartPageItem.scss";

const CartPageItem = ({ item, discount, hasDiscount }: CartPageItemProps) => {
  const { t } = useTranslate();

  const dispatch = useDispatch<AppDispatch>();

  const { getConvertedPrice } = usePriceFormatter();

  const { grams } = t.product;
  const { discount2Tr } = t.cart;
  const { removeFromCartAriaLabel } = t.buttons;

  const itemTotal = item.price_rub * item.count;
  const itemTotalUSD = (item.price_usd ?? 0) * item.count;
  const itemTotalFormatted = getConvertedPrice({
    price_rub: itemTotal,
    price_usd: itemTotalUSD,
  });
  const discountedItemTotal = Math.round(itemTotal * (1 - discount / 100));
  const discountedItemTotalUSD = Math.round(
    itemTotalUSD * (1 - discount / 100),
  );
  const discountedItemTotalFormatted = getConvertedPrice({
    price_rub: discountedItemTotal,
    price_usd: discountedItemTotalUSD,
  });

  const handlePlus = () => {
    dispatch(
      addItem({
        id: String(item.id),
        instanceId: item.instanceId,
      }),
    );
  };

  const handleMinus = () => {
    dispatch(minusItem(item.instanceId));
  };

  const handleRemove = () => {
    dispatch(removeItem(item.instanceId));
  };

  return (
    <li className="cart-page-section__item">
      <div className="cart-page-section__img">
        <Image src={item.image} alt={item.name} width={100} height={100} />
      </div>

      <div className="cart-page-section__description">
        <Link href={`/product/${item.instanceId}`}>
          <h3 className="cart-page-section__name">{item.name}</h3>
        </Link>
        <div className="cart-page-section__size">
          {item.size} {grams}
        </div>
      </div>

      <div className="cart-page-section__price">
        {hasDiscount ? (
          <>
            <span className="old-price" title={discount2Tr}>
              {itemTotalFormatted.formattedCurrent}
            </span>
            <span className="discounted-price">
              {discountedItemTotalFormatted.formattedCurrent}
            </span>
          </>
        ) : (
          itemTotalFormatted.formattedCurrent
        )}
      </div>

      <QuantityControl
        count={item.count}
        onClickPlus={handlePlus}
        onClickMinus={handleMinus}
      />

      <CloseButton
        className="cart-page-section__remove-item"
        width={18}
        height={19}
        onClick={handleRemove}
        ariaLabel={`${removeFromCartAriaLabel} ${item.name}`}
      />
    </li>
  );
};

export default CartPageItem;
