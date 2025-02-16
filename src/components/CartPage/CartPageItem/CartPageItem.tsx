import CartPageItemSkeleton from "../../ui/skeletons/CartPageItemSkeleton";

import { useDispatch } from "react-redux";

import { addItem, minusItem, removeItem } from "@/store/slices/cart.slice";

import Image from "next/image";

import "./CartPageItem.scss";

const CartPageItem = ({ id, name_ru, image, price_rub, size, count }) => {
  const formattedTotalPrice = new Intl.NumberFormat("ru-RU").format(
    price_rub * count
  );
  const dispatch = useDispatch();

  const onClickPlus = () => {
    dispatch(
      addItem({
        id,
      })
    );
  };

  const onClickMinus = () => {
    dispatch(minusItem(id));
  };

  const onClickRemove = () => {
    dispatch(removeItem(id));
  };

  return (
    // <CartPageItemSkeleton/>
    <li className="cart-page-section__item">
      <div className="cart-page-section__img">
        <Image src={image} alt="test" width={100} height={100} />
      </div>
      <div className="cart-page-section__description">
        <h3>{name_ru}</h3>
        <p>{formattedTotalPrice} ₽</p>
        <p>
          {price_rub}₽ <b>{size}г</b>
        </p>
      </div>
      <div className="cart-page-section__item-quantity">
        <button onClick={onClickMinus}>-</button>
        <span>{count}</span>
        <button onClick={onClickPlus}>+</button>
      </div>
      <div className="cart-page-section__remove-item">
        <button onClick={onClickRemove}>X</button>
      </div>
    </li>
  );
};

export default CartPageItem;
