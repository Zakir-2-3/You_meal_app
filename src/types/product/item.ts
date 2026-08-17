// Полный тип товара (с mockapi)
export interface Item {
  id: number;
  instanceId?: string;
  image: string;
  name_ru: string;
  name_en: string;
  price_rub: number;
  price_usd?: number;
  size: number;
  count?: number;
}

export interface CartItem {
  id: string;
  instanceId?: string;
  count?: number;
}

export interface CartState {
  items: CartItem[];
  savedDate: null | string;
}
