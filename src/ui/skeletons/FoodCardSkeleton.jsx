const FoodCardSkeleton = () => (
  <div
    className="food-section__card food-section__card--skeleton"
    aria-hidden="true"
  >
    <span className="sk-block sk-block--image" />
    <span className="sk-block sk-block--title" />
    <span className="sk-block sk-block--price" />
    <span className="sk-block sk-block--middle" />
    <span className="sk-block sk-block--small" />
    <span className="sk-block sk-block--button" />
  </div>
);

export default FoodCardSkeleton;
