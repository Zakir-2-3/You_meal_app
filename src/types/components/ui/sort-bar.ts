import { SortBy, SortDir } from "@/types/product/sort";

export interface SortBarProps {
  by: SortBy;
  dir: SortDir;
  onChange: (next: { by: SortBy; dir: SortDir }) => void;
}

export type { SortBy, SortDir };
