import { Item } from "../product/item";
import { UIItem } from "../utils/insert-sorted";

export interface UseProductPaginationProps {
  originalItems: Item[];
  baseDisplayedItems: Item[];
  updateBaseDisplayedItems: (updater: (prev: Item[]) => Item[]) => void;
  displayedItems: UIItem[];
  setDisplayedItems: React.Dispatch<React.SetStateAction<UIItem[]>>;
}

export interface UseProductPaginationReturn {
  handleLoadMore: () => void;
  resetPagination: () => void;
  noMorePulse: boolean;
  setNoMorePulse: (value: boolean) => void;
}
