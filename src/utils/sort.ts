import { Item } from "@/types/item";
import { SortBy, SortDir } from "@/store/slices/productMetaSlice";

const cmpNumber = (a: number, b: number) => (a === b ? 0 : a < b ? -1 : 1);

const keyOf = (it: Item) => it.instanceId ?? String(it.id);

export const getFavoritesFromItems = (items: Item[], favorites: string[]) => {
  const favSet = new Set(favorites);
  return items.filter((it) => favSet.has(it.instanceId ?? String(it.id)));
};

export function sortItems(
  items: Item[],
  sort: { by: SortBy; dir: SortDir },
  ratings: Record<string, number>,
  favorites: string[]
): Item[] {
  const arr = [...items];
  const dirFactor = sort.dir === "asc" ? 1 : -1;

  switch (sort.by) {
    case "favorites":
      return getFavoritesFromItems(arr, favorites);

    case "price":
      return arr.sort((a, b) => {
        const ca = Number(a.price_rub) || 0;
        const cb = Number(b.price_rub) || 0;
        return cmpNumber(ca, cb) * dirFactor;
      });

    case "rating":
      return arr.sort((a, b) => {
        const ra = ratings[keyOf(a)] ?? 0;
        const rb = ratings[keyOf(b)] ?? 0;
        return cmpNumber(ra, rb) * dirFactor;
      });

    default:
      return arr;
  }
}
