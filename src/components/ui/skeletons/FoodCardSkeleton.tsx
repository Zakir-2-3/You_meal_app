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
    <rect x="12" y="12" rx="18" ry="18" width="276" height="200" />
    <rect x="12" y="238" rx="3" ry="3" width="44" height="26" />
    <rect x="12" y="280" rx="3" ry="3" width="276" height="40" />
    <rect x="12" y="344" rx="3" ry="3" width="30" height="17" />
    <rect x="12" y="380" rx="12" ry="12" width="276" height="38" />
  </ContentLoader>
);

export default FoodCardSkeleton;
