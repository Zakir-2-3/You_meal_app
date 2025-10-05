import { FC } from "react";

import Image from "next/image";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { addItem, minusItem, removeItem } from "@/store/slices/cartSlice";

import QuantityControl from "@/components/QuantityControl/QuantityControl";

import { getDiscountedPrice } from "@/utils/getDiscountedPrice";

import { Item } from "@/types/item";

import "./CartPageItem.scss";

const CartPageItem: FC<Item> = ({
  id,
  instanceId,
  name_ru,
  image,
  price_rub,
  size,
  count,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { activated } = useSelector((state: RootState) => state.promo);
  const { items } = useSelector((state: RootState) => state.cart);

  const iid = instanceId ?? String(id);

  const totalCartPrice = items.reduce(
    (sum, item) => sum + item.price_rub * (item.count ?? 0),
    0
  );
  const itemTotal = price_rub * (count ?? 0);

  const { discount, hasDiscount } = getDiscountedPrice(
    activated,
    totalCartPrice
  );
  const discountedItemTotal = Math.round(itemTotal * (1 - discount / 100));

  const formattedPrice = new Intl.NumberFormat("ru-RU").format(itemTotal);
  const formattedDiscountedPrice = new Intl.NumberFormat("ru-RU").format(
    discountedItemTotal
  );

  const onClickPlus = () => {
    dispatch(addItem({ id, instanceId: iid } as Item));
  };

  const onClickMinus = () => {
    dispatch(minusItem(iid));
  };

  const onClickRemove = () => {
    dispatch(removeItem(iid));
  };

  return (
    <li className="cart-page-section__item">
      <div className="cart-page-section__img">
        <Image src={image} alt={name_ru} width={100} height={100} />
      </div>
      <div className="cart-page-section__description">
        <h3 className="cart-page-section__name">{name_ru}</h3>
        <div className="cart-page-section__price">
          {hasDiscount ? (
            <>
              <span
                className="old-price"
                title={`Скидка: ${activated.join(", ")}`}
              >
                {formattedPrice} ₽
              </span>
              <span className="discounted-price">
                {formattedDiscountedPrice}₽
              </span>
            </>
          ) : (
            `${formattedPrice}₽`
          )}
        </div>
        <div className="cart-page-section__size">{size}г.</div>
      </div>
      <QuantityControl
        count={count}
        onClickPlus={onClickPlus}
        onClickMinus={onClickMinus}
      />
      <div className="cart-page-section__remove-item">
        <button onClick={onClickRemove}>X</button>
      </div>
    </li>
  );
};

export default CartPageItem;
