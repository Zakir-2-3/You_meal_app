import CartPageItemSkeleton from "../ui/skeletons/CartPageItemSkeleton";

import Image from "next/image";

import "./CartPageItem.scss";

import test from "@/assets/images/not-found-img.png";

const CartPageItem = () => {
  return (
    // Условие и div > img > корзина пуста
    // height: 100%;
    // border: 2px dashed grey;
    // <CartPageItemSkeleton/>
    <li className="cart-page-section__item">
      <div className="cart-page-section__img">
        <Image src={test} alt="test" width={100} height={100} />
      </div>
      <div className="cart-page-section__description">
        <h3>Воппер в YourMeal</h3>
        <p>199г</p>
        <p>273₽</p>
      </div>
      <div className="cart-page-section__item-quantity">
        <button>-</button>
        <span>0</span>
        <button>+</button>
      </div>
    </li>
  );
};

export default CartPageItem;
