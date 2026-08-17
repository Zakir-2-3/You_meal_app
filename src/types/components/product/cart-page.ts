export interface EnrichedCartItem {
  id: string;
  instanceId: string;
  name: string;
  image: string;
  size: number;
  count: number;
  price_rub: number;
  price_usd: number;
}

export interface CartPageCheckProps {
  enrichedItems: EnrichedCartItem[];
  savedDate: string | null;
  rawTotal: number;
  discount: number;
  discountLabels: string[];
  savedMoney: number;
  vat: number;
  baseTotalWithVat: number;
  selectedTipPercentage: number;
  discountedTotalWithTips: number;
  currency: "rub" | "usd";
  onTipChange: (tip: number) => void;
  isLoading: boolean;
}

export interface CartPageItemProps {
  item: EnrichedCartItem;
  discount: number;
  hasDiscount: boolean;
}

export interface CartSidebarItemProps {
  item: EnrichedCartItem;
  style?: React.CSSProperties;
}
