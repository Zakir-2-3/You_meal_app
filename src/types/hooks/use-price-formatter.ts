export interface PriceData {
  price_rub: number;
  price_usd?: number;
}

export interface FormattedPrice {
  current: number;
  old: number | null;
  formattedCurrent: string;
  formattedOld: string | null;
  hasDiscount: boolean;
  isLoading: boolean;
}
