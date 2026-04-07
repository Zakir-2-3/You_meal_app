import { Item } from "@/types/product/item";

export const calcTotalPrice = (items: Item[]) => {
  return items.reduce((sum, obj) => obj.price_rub * (obj.count ?? 0) + sum, 0);
};
