import { Item } from "@/types/item";
import type { SortBy, SortDir } from "@/store/slices/productMetaSlice";

export type UIItem = Item & {
  _justAdded?: boolean;
  _animationDelay?: string;
};

const keyOf = (it: Item) => it.instanceId ?? String(it.id);

function compareForSort(
  a: Item,
  b: Item,
  sort: { by: SortBy; dir: SortDir },
  ratings: Record<string, number>
) {
  const dirFactor = sort.dir === "asc" ? 1 : -1;

  if (sort.by === "price") {
    const pa = Number(a.price_rub) || 0;
    const pb = Number(b.price_rub) || 0;
    if (pa !== pb) return (pa - pb) * dirFactor;
    return (a.name_ru || "").localeCompare(b.name_ru || "", "ru", {
      sensitivity: "base",
    });
  }

  if (sort.by === "rating") {
    const ra = ratings[keyOf(a)] ?? 0;
    const rb = ratings[keyOf(b)] ?? 0;
    if (ra !== rb) return (ra - rb) * dirFactor;
    return (a.name_ru || "").localeCompare(b.name_ru || "", "ru", {
      sensitivity: "base",
    });
  }

  return 0;
}

export function sortItemsWithAnimation(
  items: Item[],
  sort: { by: SortBy; dir: SortDir },
  ratings: Record<string, number>,
  favorites: string[]
): UIItem[] {
  if (!items || items.length === 0) return [];

  if (sort.by === "default") {
    return items.map((item, i) => ({
      ...item,
      _animationDelay: `${i * 0.1}s`,
    }));
  }

  if (sort.by === "favorites") {
    const favSet = new Set(favorites);
    const favs = items.filter((it) => favSet.has(keyOf(it)));
    return favs.map((item, i) => ({
      ...item,
      _animationDelay: `${i * 0.1}s`,
    }));
  }

  const sorted = [...items].sort((a, b) => compareForSort(a, b, sort, ratings));
  return sorted.map((item, i) => ({
    ...item,
    _animationDelay: `${i * 0.1}s`,
  }));
}

export function insertSorted(
  prevItems: UIItem[],
  newItems: Item[],
  sort: { by: SortBy; dir: SortDir },
  ratings: Record<string, number>,
  _favorites: string[],
  animationType: "fast" | "staggered" = "fast"
): UIItem[] {
  if (!newItems || newItems.length === 0) return prevItems;

  if (sort.by !== "price" && sort.by !== "rating") {
    const appended = newItems.map((it, idx) => ({
      ...it,
      _justAdded: true,
      _animationDelay: animationType === "staggered" ? `${idx * 0.1}s` : "0s",
    })) as UIItem[];
    return [...prevItems, ...appended];
  }

  const result: UIItem[] = [...prevItems];
  const sortedNew = [...newItems].sort((a, b) =>
    compareForSort(a, b, sort, ratings)
  );

  const markedNew: UIItem[] = sortedNew.map((x, idx) => ({
    ...x,
    _justAdded: true,
    _animationDelay: animationType === "staggered" ? `${idx * 0.05}s` : "0s",
  }));

  for (const item of markedNew) {
    let left = 0;
    let right = result.length;
    while (left < right) {
      const mid = (left + right) >> 1;
      const cmp = compareForSort(item, result[mid], sort, ratings);
      if (cmp < 0) right = mid;
      else left = mid + 1;
    }
    result.splice(left, 0, item);
  }

  return result;
}
