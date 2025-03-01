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
    <rect x="0" y="25" rx="4" ry="4" width="90" height="90" />
    <rect x="120" y="25" rx="4" ry="4" width="360" height="30" />
    <rect x="120" y="92" rx="4" ry="4" width="42" height="23" />
    <rect x="175" y="97" rx="4" ry="4" width="36" height="18" />
    <rect x="548" y="57" rx="4" ry="4" width="58" height="26" />
    <rect x="675" y="45" rx="6" ry="6" width="86" height="50" />
    <rect x="780" y="55" rx="25" ry="25" width="30" height="30" />
  </ContentLoader>
);

export default CartPageItemSkeleton;
