import ContentLoader from "react-content-loader";

const ProductPageSkeleton = () => (
  <ContentLoader
    speed={2}
    width={1290}
    height={680}
    viewBox="0 0 1290 680"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    uniqueKey="product-page-skeleton"
  >
    <rect x="0" y="0" rx="5" ry="5" width="500" height="450" />
    <rect x="60" y="490" rx="6" ry="6" width="80" height="80" />
    <rect x="160" y="490" rx="6" ry="6" width="80" height="80" />
    <rect x="260" y="490" rx="6" ry="6" width="80" height="80" />
    <rect x="360" y="490" rx="6" ry="6" width="80" height="80" />
    <rect x="600" y="2" rx="4" ry="4" width="690" height="45" />
    <rect x="600" y="113" rx="4" ry="4" width="180" height="30" />
    <rect x="600" y="70" rx="4" ry="4" width="130" height="28" />
    <rect x="600" y="174" rx="4" ry="4" width="90" height="40" />
    <rect x="710" y="174" rx="9" ry="9" width="250" height="40" />
    <rect x="600" y="254" rx="4" ry="4" width="690" height="110" />
    <rect x="600" y="402" rx="4" ry="4" width="168" height="28" />
    <rect x="600" y="440" rx="4" ry="4" width="690" height="265" />
  </ContentLoader>
);

export default ProductPageSkeleton;
