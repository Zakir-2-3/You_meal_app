import { UIItem } from "@/types/utils/insert-sorted";

export interface ProductGridProps {
  items: UIItem[];
  uiPhase: "idle" | "loading" | "ready" | "empty";
  sortBy: string;
  sortDir: string;
  nothingFoundText: string;
  onRemoveFromFavorites?: (instanceId: string) => void;
  favoritesCount?: number;
  isProductNavigating?: boolean;
  onProductNavigate?: () => void;
}
