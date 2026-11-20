const CartSidebarItemSkeleton = () => (
  <li
    className="cart-sidebar__item cart-sidebar__item--skeleton"
    aria-hidden="true"
  >
    <span className="sk-block sk-block--img" />
    <div className="cart-sidebar__item-description">
      <span className="sk-block sk-block--title" />
      <span className="sk-block sk-block--price" />
    </div>
    <span className="sk-block sk-block--qty" />
  </li>
);

export default CartSidebarItemSkeleton;
