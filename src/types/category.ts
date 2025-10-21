export interface CategoryState {
  activeIndex: number;
  activeKey: string;
}

export type CategoryKey =
  | "burgers"
  | "snacks"
  | "combo"
  | "shawarma"
  | "breakfasts"
  | "drinks"
  | "desserts"
  | "sauces";

export interface Category {
  id: number;
  key: string;
  title?: string;
  image: string;
}
