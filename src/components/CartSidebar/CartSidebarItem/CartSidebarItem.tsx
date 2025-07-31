import { FC } from "react";
import Image from "next/image";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { addItem, minusItem } from "@/store/slices/cartSlice";

import { getDiscountedPrice } from "@/utils/getDiscountedPrice";

import { Item } from "@/types/item";

import "./CartSidebarItem.scss";

const CartSidebarItem: FC<Item> = ({
  id,
  name_ru,
  image,
  price_rub,
  size,
  count,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const activated = useSelector((state: RootState) => state.promo.activated);

  const { discount, hasDiscount } = getDiscountedPrice(activated, price_rub);
  const discountedPrice = Math.round(price_rub * (1 - discount / 100));

  // Прибавить товар +1
  const onClickPlus = () => {
    dispatch(
      addItem({
        id,
      } as Item)
    );
  };

  // Убавить товар -1
  const onClickMinus = () => {
    dispatch(minusItem(id));
  };

  return (
    <li className="cart-sidebar__item">
      <div className="cart-sidebar__item-img">
        <Image src={image} alt={name_ru} width={64} height={64} />
      </div>
      <div className="cart-sidebar__item-description">
        <h3>{name_ru}</h3>
        <p>
          {hasDiscount ? (
            <>
              <span className="old-price">{price_rub}₽</span>
              <span className="discounted-price">
                {discountedPrice.toFixed(0)}₽
              </span>
            </>
          ) : (
            `${price_rub}₽`
          )}
        </p>
      </div>
      <div className="cart-sidebar__item-quantity">
        <button onClick={onClickMinus}>-</button>
        <span style={{ color: count === 99 ? "red" : "inherit" }}>{count}</span>
        <button onClick={onClickPlus}>+</button>
      </div>
    </li>
  );
};

export default CartSidebarItem;
