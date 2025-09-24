import { SortBy } from "@/store/slices/productMetaSlice";

export const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "default", label: "По умолчанию" },
  { value: "price", label: "Цена" },
  { value: "rating", label: "Рейтинг" },
  { value: "favorites", label: "Избранные" },
];
