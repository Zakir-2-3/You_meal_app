const CartPageItemSkeleton = () => (
  <li
    className="cart-page-section__item cart-page-section__item--skeleton"
    aria-hidden="true"
  >
    <div className="cart-page-section__img">
      <span className="sk-block sk-block--img" />
    </div>

    <div className="cart-page-section__description">
      <span className="sk-block sk-block--name" />
      <span className="cart-page-section__size sk-block sk-block--size" />
    </div>

    <span className="sk-block sk-block--price" />
    <span className="sk-block sk-block--qty" />
    <span className="sk-block sk-block--remove" />
  </li>
);

export default CartPageItemSkeleton;
