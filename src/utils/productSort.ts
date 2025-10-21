import { SortBy, SortDir } from "@/store/slices/productMetaSlice";

import { Item } from "@/types/item";

// Функция для парсинга instanceId в числовые значения для сортировки
export const parseInstanceId = (instanceId: string) => {
  const match = instanceId.match(/^(\d+)(-copy-(\d+))?$/);
  if (match) {
    const originalId = parseInt(match[1]);
    const copyIndex = match[3] ? parseInt(match[3]) : 0;
    return { originalId, copyIndex, sortKey: originalId * 1000 + copyIndex };
  }
  return { originalId: 0, copyIndex: 0, sortKey: 0 };
};

// Стабильная сортировка товаров
export const sortProducts = (
  products: Item[],
  sort: { by: SortBy; dir: SortDir },
  ratings: Record<string, number>,
  favorites: string[]
): Item[] => {
  return [...products].sort((a, b) => {
    const aId = a.instanceId || String(a.id);
    const bId = b.instanceId || String(b.id);

    switch (sort.by) {
      case "price":
        const priceA = a.price_rub;
        const priceB = b.price_rub;
        if (priceA !== priceB) {
          return sort.dir === "asc" ? priceA - priceB : priceB - priceA;
        }
        // При одинаковой цене сортируем по ID для стабильности
        return parseInstanceId(aId).sortKey - parseInstanceId(bId).sortKey;

      case "rating":
        const ratingA = ratings[aId] || 0;
        const ratingB = ratings[bId] || 0;
        if (ratingA !== ratingB) {
          return sort.dir === "asc" ? ratingA - ratingB : ratingB - ratingA;
        }
        // При одинаковом рейтинге сортируем по ID для стабильности
        return parseInstanceId(aId).sortKey - parseInstanceId(bId).sortKey;

      case "favorites":
        const aFav = favorites.includes(aId);
        const bFav = favorites.includes(bId);
        if (aFav !== bFav) {
          return bFav ? 1 : -1; // Избранные первыми
        }
        // При одинаковом статусе избранного сортируем по ID
        return parseInstanceId(aId).sortKey - parseInstanceId(bId).sortKey;

      case "default":
      default:
        // Сортировка по умолчанию: сначала по originalId, потом по copyIndex
        const aParsed = parseInstanceId(aId);
        const bParsed = parseInstanceId(bId);

        if (aParsed.originalId !== bParsed.originalId) {
          return aParsed.originalId - bParsed.originalId;
        }
        return aParsed.copyIndex - bParsed.copyIndex;
    }
  });
};
