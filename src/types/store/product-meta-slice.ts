import { SortBy, SortDir } from "../product/sort";

export interface ProductMetaState {
  ratings: Record<string, number>;
  favorites: string[];
  sort: { by: SortBy; dir: SortDir };
  metaSynced: boolean;
}
