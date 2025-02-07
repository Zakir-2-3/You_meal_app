import ContentLoader from "react-content-loader";

const CartPageItemSkeleton = () => (
  <ContentLoader
    speed={2}
    width={810}
    height={140}
    viewBox="0 0 810 140"
    backgroundColor="#f3f3f3"
    foregroundColor="#ffffff"
    uniqueKey="cart-page-item-skeleton"
  >
    <rect x="0" y="20" rx="4" ry="4" width="100" height="100" />
    <rect x="120" y="20" rx="4" ry="4" width="580" height="30" />
    <rect x="120" y="97" rx="4" ry="4" width="42" height="23" />
    <rect x="664" y="102" rx="4" ry="4" width="36" height="18" />
    <rect x="720" y="50" rx="6" ry="6" width="90" height="50" />
  </ContentLoader>
);

export default CartPageItemSkeleton;
