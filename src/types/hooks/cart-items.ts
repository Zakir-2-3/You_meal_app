export interface EnrichedCartItem {
  id: string;
  instanceId: string;
  name: string;
  name_ru: string;
  name_en: string;
  image: string;
  size: number;
  count: number;
  price_rub: number;
  price_usd: number;
}

export interface UseCartItemsReturn {
  enrichedItems: EnrichedCartItem[];
  isLoading: boolean;
  rawTotal: number;
  rawTotalUSD: number;
  discount: number;
  hasDiscount: boolean;
  discountLabels: string[];
  savedMoney: number;
  savedMoneyUSD: number;
  vat: number;
  baseTotalWithVat: number;
  discountedTotalWithTips: number;
  tipsAmount: number;
}
