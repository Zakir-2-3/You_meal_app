"use client";

import { FC } from "react";

import Image from "next/image";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { addItem, minusItem } from "@/store/slices/cartSlice";

import QuantityControl from "@/components/product/QuantityControl/QuantityControl";

import { getDiscountedPrice } from "@/utils/cart/getDiscountedPrice";

import { usePriceFormatter } from "@/hooks/cart/usePriceFormatter";
import { useTranslate } from "@/hooks/app/useTranslate";

import { Item } from "@/types/product/item";

import "./CartSidebarItem.scss";

const CartSidebarItem: FC<Item> = ({
  id,
  instanceId,
  name_ru,
  name_en,
  image,
  price_rub,
  price_usd,
  count,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const activated = useSelector((state: RootState) => state.promo.activated);
  const { getConvertedPrice } = usePriceFormatter();
  const { lang } = useTranslate();

  const { discount } = getDiscountedPrice(activated, price_rub);
  const prices = getConvertedPrice({ price_rub, price_usd }, discount);
  const iid = instanceId ?? String(id);

  const onClickPlus = () => dispatch(addItem({ id, instanceId: iid } as Item));
  const onClickMinus = () => dispatch(minusItem(iid));

  return (
    <li className="cart-sidebar__item">
      <div className="cart-sidebar__item-img">
        <Image src={image} alt={name_ru} width={64} height={64} />
      </div>

      <div className="cart-sidebar__item-description">
        <h3 className="cart-sidebar__item-title">
          {lang === "ru" ? name_ru : name_en}
        </h3>

        <div className="cart-sidebar__item-price">
          {prices.hasDiscount ? (
            <>
              <span className="old-price">{prices.formattedOld}</span>
              <span className="discounted-price">
                {prices.formattedCurrent}
              </span>
            </>
          ) : (
            prices.formattedCurrent
          )}
        </div>
      </div>

      <QuantityControl
        count={count}
        onClickPlus={onClickPlus}
        onClickMinus={onClickMinus}
      />
    </li>
  );
};

export default CartSidebarItem;
