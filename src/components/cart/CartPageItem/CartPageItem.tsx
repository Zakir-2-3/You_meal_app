import { FC } from "react";

import Image from "next/image";
import Link from "next/link";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { addItem, minusItem, removeItem } from "@/store/slices/cartSlice";

import QuantityControl from "@/components/product/QuantityControl/QuantityControl";

import { usePriceFormatter } from "@/hooks/cart/usePriceFormatter";
import { useTranslate } from "@/hooks/app/useTranslate";

import { getDiscountedPrice } from "@/utils/cart/getDiscountedPrice";

import CloseButton from "@/UI/buttons/CloseButton/CloseButton";

import { Item } from "@/types/product/item";

import "./CartPageItem.scss";

const CartPageItem: FC<Item> = ({
  id,
  instanceId,
  name_ru,
  name_en,
  image,
  price_rub,
  size,
  count,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const { activated } = useSelector((state: RootState) => state.promo);
  const { items } = useSelector((state: RootState) => state.cart);
  const { getConvertedPrice } = usePriceFormatter();

  const { t, lang } = useTranslate();

  const { grams } = t.product;
  const { discount2Tr } = t.cart;
  const { removeFromCartAriaLabel } = t.buttons;

  const iid = instanceId ?? String(id);

  const totalCartPrice = items.reduce(
    (sum, item) => sum + item.price_rub * (item.count ?? 0),
    0,
  );
  const itemTotal = price_rub * (count ?? 0);

  const { discount, hasDiscount } = getDiscountedPrice(
    activated,
    totalCartPrice,
  );

  // Используем хук для форматирования цен
  const itemTotalFormatted = getConvertedPrice({ price_rub: itemTotal });
  const discountedItemTotal = Math.round(itemTotal * (1 - discount / 100));
  const discountedItemTotalFormatted = getConvertedPrice({
    price_rub: discountedItemTotal,
  });

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
        <Link href={`/product/${iid}`}>
          <h3 className="cart-page-section__name">
            {lang === "ru" ? name_ru : name_en}
          </h3>
        </Link>
        <div className="cart-page-section__price">
          {hasDiscount ? (
            <>
              <span
                className="old-price"
                title={`${discount2Tr} ${activated.join(", ")}`}
              >
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
        <div className="cart-page-section__size">
          {size} {grams}
        </div>
      </div>
      <QuantityControl
        count={count}
        onClickPlus={onClickPlus}
        onClickMinus={onClickMinus}
      />
      <CloseButton
        className="cart-page-section__remove-item"
        width={18}
        height={19}
        onClick={onClickRemove}
        ariaLabel={`${removeFromCartAriaLabel} ${
          lang === "ru" ? name_ru : name_en
        }`}
      />
    </li>
  );
};

export default CartPageItem;
