"use client";

import dynamic from "next/dynamic";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

import { useTranslate } from "@/hooks/app/useTranslate";

import { SortBarProps } from "@/types/components/ui/sort-bar";
import { LoadMoreButtonProps } from "@/types/product/load-more-button";
import { HomeContentProps } from "@/types/components/home/home-content";
import { ProductGridProps } from "@/types/components/product/product-grid";

const CartSidebar = dynamic(
  () => import("@/components/layout/Sidebar/CartSidebar/CartSidebar"),
  {
    ssr: false,
    loading: () => <div className="cart-sidebar" style={{ minHeight: 109 }} />,
  },
);

const FoodCategories = dynamic(
  () => import("@/components/product/FoodCategories/FoodCategories"),
  {
    ssr: false,
    loading: () => <nav className="food-categories" />,
  },
);

const FoodCategoriesSearch = dynamic(
  () =>
    import("@/components/product/FoodCategoriesSearch/FoodCategoriesSearch"),
  {
    ssr: false,
  },
);

const SortBar = dynamic<SortBarProps>(
  () => import("@/components/product/SortBar/SortBar"),
  {
    ssr: false,
    loading: () => <div className="sort-bar" />,
  },
);

const ProductGrid = dynamic<
  ProductGridProps & { onRemoveFromFavorites?: (instanceId: string) => void }
>(
  () =>
    import("@/components/product/ProductGrid/ProductGrid").then(
      (mod) => mod.ProductGrid,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="food-section__wrapper" style={{ minHeight: 200 }} />
    ),
  },
);

const LoadMoreButton = dynamic<LoadMoreButtonProps>(
  () =>
    import("@/UI/buttons/LoadMoreButton/LoadMoreButton").then(
      (mod) => mod.LoadMoreButton,
    ),
  {
    ssr: false,
  },
);

export default function HomeContent({
  displayedItems,
  uiPhase,
  sortBy,
  sortDir,
  nothingFoundText,
  searchValue,
  isSearchOpen,
  setSearchValue,
  onSearchToggle,
  onRemoveFromFavorites,
  handleLoadMore,
  noMorePulse,
  handleSortChange,
  isProductNavigating,
  onProductNavigate,
}: HomeContentProps) {
  const { t } = useTranslate();

  const categoryTitle = (t.categories as Record<string, string>)[
    useSelector((state: RootState) => state.category.activeKey)
  ];
  const favoritesLength = useSelector(
    (state: RootState) => state.productMeta.favorites.length,
  );

  const { loadMore } = t.buttons;

  return (
    <div className="container main-content-wrapper">
      <nav
        className={`food-categories ${isSearchOpen ? "food-categories--search-open" : ""}`}
      >
        <FoodCategories />
        <FoodCategoriesSearch
          setSearchValue={setSearchValue}
          onSearchToggle={onSearchToggle}
        />
      </nav>

      <CartSidebar />

      <section className="food-section">
        <h2 className="food-section__title">{categoryTitle}</h2>
        <SortBar by={sortBy} dir={sortDir} onChange={handleSortChange} />
        <ProductGrid
          items={displayedItems}
          uiPhase={uiPhase}
          sortBy={sortBy}
          sortDir={sortDir}
          nothingFoundText={nothingFoundText}
          onRemoveFromFavorites={onRemoveFromFavorites}
          favoritesCount={favoritesLength}
          isProductNavigating={isProductNavigating}
          onProductNavigate={onProductNavigate}
        />
        {uiPhase === "ready" &&
          displayedItems.length > 0 &&
          !searchValue &&
          (sortBy !== "favorites" ||
            displayedItems.length < favoritesLength) && (
            <LoadMoreButton
              onClick={handleLoadMore}
              label={loadMore}
              noMorePulse={noMorePulse}
            />
          )}
      </section>
    </div>
  );
}
