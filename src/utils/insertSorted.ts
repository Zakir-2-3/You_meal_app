import type { SortBy, SortDir } from "@/store/slices/productMetaSlice";

import { Item } from "@/types/item";

export type UIItem = Item & {
  _justAdded?: boolean;
  _animationDelay?: string;
};

const keyOf = (it: Item) => it.instanceId ?? String(it.id);

// Функция для парсинга instanceId в числовые значения для сортировки
const parseInstanceId = (instanceId: string) => {
  const match = instanceId.match(/^(\d+)(-copy-(\d+))?$/);
  if (match) {
    const originalId = parseInt(match[1]);
    const copyIndex = match[3] ? parseInt(match[3]) : 0;
    return { originalId, copyIndex, sortKey: originalId * 1000 + copyIndex };
  }
  return { originalId: 0, copyIndex: 0, sortKey: 0 };
};

// Стабильный компаратор для сортировки
function compareForSort(
  a: Item,
  b: Item,
  sort: { by: SortBy; dir: SortDir },
  ratings: Record<string, number>,
  favorites: string[]
) {
  const dirFactor = sort.dir === "asc" ? 1 : -1;

  if (sort.by === "price") {
    const pa = Number(a.price_rub) || 0;
    const pb = Number(b.price_rub) || 0;
    if (pa !== pb) return (pa - pb) * dirFactor;
    // При одинаковой цене сортируем по ID для стабильности
    return (
      parseInstanceId(keyOf(a)).sortKey - parseInstanceId(keyOf(b)).sortKey
    );
  }

  if (sort.by === "rating") {
    const ra = ratings[keyOf(a)] ?? 0;
    const rb = ratings[keyOf(b)] ?? 0;
    if (ra !== rb) return (ra - rb) * dirFactor;
    // При одинаковом рейтинге сортируем по ID для стабильности
    return (
      parseInstanceId(keyOf(a)).sortKey - parseInstanceId(keyOf(b)).sortKey
    );
  }

  if (sort.by === "favorites") {
    const aFav = favorites.includes(keyOf(a));
    const bFav = favorites.includes(keyOf(b));
    if (aFav !== bFav) return (aFav ? -1 : 1) * dirFactor;
    // При одинаковом статусе избранного сортируем по ID
    return (
      parseInstanceId(keyOf(a)).sortKey - parseInstanceId(keyOf(b)).sortKey
    );
  }

  // Для сортировки по умолчанию используем стабильную сортировку по ID
  return parseInstanceId(keyOf(a)).sortKey - parseInstanceId(keyOf(b)).sortKey;
}

export function sortItemsWithAnimation(
  items: Item[],
  sort: { by: SortBy; dir: SortDir },
  ratings: Record<string, number>,
  favorites: string[]
): UIItem[] {
  if (!items || items.length === 0) return [];

  if (sort.by === "default") {
    // Сортируем по умолчанию с учетом структуры ID
    const sorted = [...items].sort(
      (a, b) =>
        parseInstanceId(keyOf(a)).sortKey - parseInstanceId(keyOf(b)).sortKey
    );
    return sorted.map((item, i) => ({
      ...item,
      _animationDelay: `${i * 0.15}s`,
    }));
  }

  if (sort.by === "favorites") {
    const favSet = new Set(favorites);
    const favs = items.filter((it) => favSet.has(keyOf(it)));
    // Сортируем избранные по тому же принципу
    const sortedFavs = [...favs].sort(
      (a, b) =>
        parseInstanceId(keyOf(a)).sortKey - parseInstanceId(keyOf(b)).sortKey
    );
    return sortedFavs.map((item, i) => ({
      ...item,
      _animationDelay: `${i * 0.15}s`,
    }));
  }

  const sorted = [...items].sort((a, b) =>
    compareForSort(a, b, sort, ratings, favorites)
  );
  return sorted.map((item, i) => ({
    ...item,
    _animationDelay: `${i * 0.15}s`,
  }));
}

export function insertSorted(
  prevItems: UIItem[],
  newItems: Item[],
  sort: { by: SortBy; dir: SortDir },
  ratings: Record<string, number>,
  favorites: string[],
  animationType: "fast" | "staggered" = "fast"
): UIItem[] {
  if (!newItems || newItems.length === 0) return prevItems;

  if (sort.by !== "price" && sort.by !== "rating") {
    // Для сортировки по умолчанию и избранному добавляем в конец, но предварительно сортируем
    const sortedNew = [...newItems].sort(
      (a, b) =>
        parseInstanceId(keyOf(a)).sortKey - parseInstanceId(keyOf(b)).sortKey
    );
    const appended = sortedNew.map((it, idx) => ({
      ...it,
      _justAdded: true,
      _animationDelay: animationType === "staggered" ? `${idx * 0.1}s` : "0s",
    })) as UIItem[];
    return [...prevItems, ...appended];
  }

  const result: UIItem[] = [...prevItems];
  const sortedNew = [...newItems].sort((a, b) =>
    compareForSort(a, b, sort, ratings, favorites)
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
      const cmp = compareForSort(item, result[mid], sort, ratings, favorites);
      if (cmp < 0) right = mid;
      else left = mid + 1;
    }
    result.splice(left, 0, item);
  }

  return result;
}
