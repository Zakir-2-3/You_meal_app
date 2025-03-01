import ContentLoader from "react-content-loader";

const ProductPageSkeleton = () => (
  <ContentLoader
    speed={2}
    width={1290}
    height={665}
    viewBox="0 0 1290 665"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    uniqueKey="product-page-skeleton"
  >
    <rect x="0" y="70" rx="4" ry="4" width="500" height="450" />
    <rect x="600" y="0" rx="4" ry="4" width="690" height="90" />
    <rect x="600" y="115" rx="4" ry="4" width="130" height="30" />
    <rect x="600" y="178" rx="4" ry="4" width="90" height="40" />
    <rect x="710" y="178" rx="12" ry="12" width="250" height="40" />
    <rect x="600" y="250" rx="4" ry="4" width="690" height="100" />
    <rect x="600" y="380" rx="4" ry="4" width="170" height="28" />
    <rect x="600" y="430" rx="4" ry="4" width="690" height="241" />
  </ContentLoader>
);

export default ProductPageSkeleton;
