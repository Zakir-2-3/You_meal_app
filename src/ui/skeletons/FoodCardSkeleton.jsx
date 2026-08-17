import ContentLoader from "react-content-loader";

const FoodCardSkeleton = () => (
  <ContentLoader
    speed={2}
    width={300}
    height={430}
    viewBox="0 0 300 430"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    uniqueKey="food-card-skeleton"
  >
    <rect x="12" y="12" rx="18" ry="18" width="276" height="180" />
    <rect x="12" y="208" rx="4" ry="4" width="210" height="26" />
    <rect x="12" y="244" rx="4" ry="4" width="52" height="24" />
    <rect x="12" y="283" rx="5" ry="5" width="142" height="22" />
    <rect x="12" y="344" rx="4" ry="4" width="45" height="20" />
    <rect x="12" y="380" rx="6" ry="6" width="276" height="38" />
  </ContentLoader>
);

export default FoodCardSkeleton;
