import ContentLoader from "react-content-loader";

const CartSidebarItemSkeleton = () => (
  <ContentLoader
    speed={2}
    width={268}
    height={84}
    viewBox="0 0 268 84"
    backgroundColor="#f3f3f3"
    foregroundColor="#ffffff"
    uniqueKey="cart-sidebar-item-skeleton"
  >
    <rect x="1" y="10" rx="4" ry="4" width="64" height="64" />
    <rect x="73" y="10" rx="2" ry="2" width="103" height="20" />
    <rect x="74" y="54" rx="2" ry="2" width="30" height="17" />
    <rect x="206" y="22" rx="6" ry="6" width="60" height="36" />
  </ContentLoader>
);

export default CartSidebarItemSkeleton;
