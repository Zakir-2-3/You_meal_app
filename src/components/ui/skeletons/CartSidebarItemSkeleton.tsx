import ContentLoader from "react-content-loader";

const CartSidebarItemSkeleton = () => (
  <ContentLoader
    speed={2}
    width={268}
    height={84}
    viewBox="0 0 268 84"
    backgroundColor="#f3f3f3"
    foregroundColor="#ffffff"
  >
    <rect x="1" y="12" rx="4" ry="4" width="64" height="64" />
    <rect x="73" y="12" rx="0" ry="0" width="103" height="33" />
    <rect x="74" y="59" rx="0" ry="0" width="30" height="17" />
    <rect x="115" y="59" rx="0" ry="0" width="30" height="17" />
    <rect x="185" y="22" rx="6" ry="6" width="80" height="40" />
  </ContentLoader>
);

export default CartSidebarItemSkeleton;
