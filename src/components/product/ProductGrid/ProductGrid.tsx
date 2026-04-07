import { FC } from "react";

import FoodCard from "@/components/product/FoodCard/FoodCard";

import FoodCardSkeleton from "@/UI/skeletons/FoodCardSkeleton";

import { ProductGridProps } from "@/types/components/product/product-grid";

export const ProductGrid: FC<ProductGridProps> = ({
  items,
  uiPhase,
  sortBy,
  nothingFoundText,
}) => {
  if (uiPhase === "idle" || uiPhase === "loading") {
    return (
      <div className="food-section__wrapper">
        {[...new Array(6)].map((_, i) => (
          <FoodCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (uiPhase === "empty") {
    return (
      <p className="food-section__empty">
        <b>¯\_(ツ)_/¯</b>
        <br /> {nothingFoundText}
      </p>
    );
  }

  // uiPhase === "ready"
  return (
    <div className="food-section__wrapper">
      {items.map((obj) => (
        <div
          key={obj.instanceId}
          className={`food-card-animated-wrapper ${
            obj._justAdded
              ? sortBy === "price" || sortBy === "rating"
                ? "food-card-just-added-fast"
                : "food-card-just-added"
              : ""
          }`}
          style={{
            animationDelay: obj._animationDelay ?? "0s",
          }}
        >
          <FoodCard {...obj} id={Number(obj.id)} instanceId={obj.instanceId} />
        </div>
      ))}
    </div>
  );
};
