import { Item } from "@/types/product/item";
import { CategoryKey } from "@/types/product/category";

export type UIPhase = "idle" | "loading" | "ready" | "empty";

export interface UseProductLoaderReturn {
  originalItems: Item[];
  baseDisplayedItems: Item[];
  uiPhase: UIPhase;
  loadProducts: (
    categoryKey?: CategoryKey,
    searchValue?: string,
  ) => Promise<void>;
  resetProducts: () => void;
  updateBaseDisplayedItems: (updater: (prev: Item[]) => Item[]) => void;
}
