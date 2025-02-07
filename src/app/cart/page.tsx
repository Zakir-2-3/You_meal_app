import CartPageItem from "@/components/CartPage/CartPageItem/CartPageItem";
import CartPageCheck from "@/components/CartPage/CartPageCheck/CartPageCheck";

import "./cartPage.scss";

export default function CartPage() {
  return (
    <section className="cart-page-section">
      <div className="container cart-page-container">
        <h1 className="cart-page-section__title">Корзина</h1>
        <div className="cart-page-section__list-wrapper">
          <ul className="cart-page-section__list">
            <CartPageItem />
            <CartPageItem />
            <CartPageItem />
          </ul>
        </div>
        <div className="cart-page-section__right-side">
          <div className="cart-page-section__total-price">
            <CartPageCheck />
          </div>
          <button className="cart-page-section__pay-btn">Оформить заказ</button>
        </div>
      </div>
    </section>
  );
}
