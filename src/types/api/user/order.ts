import { Item } from "@/types/product/item";

export interface OrderRequest {
  email: string;
  items: Item[];
  rawTotal: number;
  discount: number;
  vat: number;
  tips: number;
  savedMoney: number;
  tipsPercent: number;
  finalTotal: number;
  activated?: string[];
  lang?: "ru" | "en";
  currency?: "rub" | "usd";
}
