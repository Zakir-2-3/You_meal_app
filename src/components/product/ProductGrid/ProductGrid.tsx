import { FC, useState, useEffect } from "react";

import FoodCard from "@/components/product/FoodCard/FoodCard";

import FoodCardSkeleton from "@/UI/skeletons/FoodCardSkeleton";

import { ProductGridProps } from "@/types/components/product/product-grid";

export const ProductGrid: FC<
  ProductGridProps & {
    onRemoveFromFavorites?: (instanceId: string) => void;
    isProductNavigating?: boolean;
    onProductNavigate?: () => void;
  }
> = ({
  items,
  uiPhase,
  sortBy,
  sortDir,
  nothingFoundText,
  onRemoveFromFavorites,
  favoritesCount,
  isProductNavigating,
  onProductNavigate,
}) => {
  const [containerKey, setContainerKey] = useState(0);
  const [prevSortBy, setPrevSortBy] = useState(sortBy);
  const [prevSortDir, setPrevSortDir] = useState(sortDir);

  useEffect(() => {
    if (sortBy !== prevSortBy || sortDir !== prevSortDir) {
      setContainerKey((prev) => prev + 1);
      setPrevSortBy(sortBy);
      setPrevSortDir(sortDir);
    }
  }, [sortBy, sortDir, prevSortBy, prevSortDir]);

  // Скелетоны и пустые состояния без изменений
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
  // Пока избранные есть, но ещё не загружены – показываем скелетоны
  if (
    uiPhase === "ready" &&
    items.length === 0 &&
    sortBy === "favorites" &&
    (favoritesCount ?? 0) > 0
  ) {
    return (
      <div className="food-section__wrapper">
        {[...new Array(6)].map((_, i) => (
          <FoodCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  // Если избранных действительно нет – сообщение
  if (
    uiPhase === "ready" &&
    items.length === 0 &&
    sortBy === "favorites" &&
    (favoritesCount ?? 0) === 0
  ) {
    return (
      <p className="food-section__empty">
        <b>¯\_(ツ)_/¯</b>
        <br /> {nothingFoundText}
      </p>
    );
  }
  if (uiPhase === "ready" && items.length === 0) {
    return (
      <div className="food-section__wrapper">
        {[...new Array(6)].map((_, i) => (
          <FoodCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div key={containerKey} className="food-section__wrapper">
      {items.map((obj) => {
        const iid = obj.instanceId ?? String(obj.id);
        return (
          <div
            key={iid}
            className={`food-card-animated-wrapper ${
              obj._justAdded
                ? sortBy === "price" || sortBy === "rating"
                  ? "food-card-just-added-fast"
                  : "food-card-just-added"
                : ""
            }`}
            style={{ animationDelay: obj._animationDelay ?? "0s" }}
          >
            <FoodCard
              {...obj}
              id={Number(obj.id)}
              instanceId={iid}
              isFavoritesMode={sortBy === "favorites"}
              onRemoveFromFavorites={onRemoveFromFavorites}
              isProductNavigating={isProductNavigating}
              onNavigate={onProductNavigate}
            />
          </div>
        );
      })}
    </div>
  );
};
