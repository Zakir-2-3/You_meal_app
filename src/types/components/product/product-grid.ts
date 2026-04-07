import { UIItem } from "@/types/utils/insert-sorted";

export interface ProductGridProps {
  items: UIItem[];
  uiPhase: "idle" | "loading" | "ready" | "empty";
  sortBy: string;
  nothingFoundText: string;
}
