import ContentLoader from "react-content-loader";

const TotalPriceItemListSkeleton = () => (
  <ContentLoader
    speed={2}
    width={292}
    height={150}
    viewBox="0 0 292 150"
    backgroundColor="#f3f3f3"
    foregroundColor="#ffffff"
    uniqueKey="total-price-item-list-skeleton"
  >
    <rect x="0" y="0" rx="2" ry="2" width="292" height="21" />
    <rect x="0" y="30" rx="2" ry="2" width="292" height="21" />
    <rect x="0" y="60" rx="2" ry="2" width="292" height="21" />
    <rect x="0" y="90" rx="2" ry="2" width="292" height="21" />
  </ContentLoader>
);

export default TotalPriceItemListSkeleton;
