import { SortBy } from "@/store/slices/productMetaSlice";

export const SORT_OPTIONS: { value: SortBy }[] = [
  { value: "default" },
  { value: "price" },
  { value: "rating" },
  { value: "favorites" },
];
