import { UIItem } from "@/types/utils/insert-sorted";
import { SortBy, SortDir } from "@/types/product/sort";

export interface HomeContentProps {
  displayedItems: UIItem[];
  uiPhase: "idle" | "loading" | "ready" | "empty";
  sortBy: SortBy;
  sortDir: SortDir;
  nothingFoundText: string;
  searchValue: string;
  isSearchOpen: boolean;
  setSearchValue: (value: string) => void;
  onSearchToggle: (open: boolean) => void;
  onRemoveFromFavorites: (instanceId: string) => void;
  handleLoadMore: () => void;
  noMorePulse: boolean;
  handleSortChange: (sort: { by: SortBy; dir: SortDir }) => void;
  isProductNavigating: boolean;
  onProductNavigate: () => void;
}
