"use client";

import Image from "next/image";

import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { addItem, minusItem } from "@/store/slices/cartSlice";

import QuantityControl from "@/components/product/QuantityControl/QuantityControl";

import { usePriceFormatter } from "@/hooks/cart/usePriceFormatter";

import { CartSidebarItemProps } from "@/types/components/product/cart-page";

import "./CartSidebarItem.scss";

const CartSidebarItem = ({ item, style }: CartSidebarItemProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const { getConvertedPrice } = usePriceFormatter();

  const discount = 0;

  const prices = getConvertedPrice(
    { price_rub: item.price_rub, price_usd: item.price_usd },
    discount,
  );

  const iid = item.instanceId;

  const onClickPlus = () =>
    dispatch(addItem({ id: String(item.id), instanceId: iid }));

  const onClickMinus = () => dispatch(minusItem(iid));

  return (
    <li className="cart-sidebar__item" style={style}>
      <div className="cart-sidebar__item-img">
        {item.image?.trim() ? (
          <Image src={item.image} alt={item.name} width={64} height={64} />
        ) : null}
      </div>

      <div className="cart-sidebar__item-description">
        <h3 className="cart-sidebar__item-title">{item.name}</h3>
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
        count={item.count}
        onClickPlus={onClickPlus}
        onClickMinus={onClickMinus}
      />
    </li>
  );
};

export default CartSidebarItem;
