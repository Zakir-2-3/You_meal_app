import Image from "next/image";
import "./CartSidebar.scss";

import ff from "@/assets/images/hero-section-img-1.png";
import dd from "@/assets/icons/delivery-icon.png";

const CartSidebar = () => {
  return (
    <aside className="cart-sidebar">
      <div className="cart-sidebar__total-orders">
        <h2>Корзина</h2>
        <span>4</span>
      </div>
      <div className="cart-sidebar__description-orders">
        <ul className="cart-sidebar__list">
          <li className="cart-sidebar__item">
            <div className="cart-sidebar__item-img">
              <Image src={ff} alt="ff" />
            </div>
            <div className="cart-sidebar__item-description">
              <h3>Супер сырный</h3>
              <p>512г</p>
              <p>550P</p>
            </div>
            <div className="cart-sidebar__item-quantity">
              <button>-</button>
              <span>1</span>
              <button>+</button>
            </div>
          </li>
        </ul>
      </div>
      <div className="cart-sidebar__total-price">
        <p>Итого:</p>
        <span>1279P</span>
      </div>
      <div className="cart-sidebar__place-order">
        <button>Оформить заказ</button>
      </div>
      <div className="cart-sidebar__delivery">
        <Image src={dd} alt="dd" />
        <p>Бесплатная доставка</p>
      </div>
    </aside>
  );
};

export default CartSidebar;
