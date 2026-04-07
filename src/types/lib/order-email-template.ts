import { Item } from "../product/item";

export type OrderEmailParams = {
  orderNumber: number;
  items: Item[];
  rawTotal: number;
  discount: number;
  vat: number;
  tips: number;
  tipsPercent: number;
  finalTotal: number;
  activated?: string[];
  lang?: "ru" | "en";
};
