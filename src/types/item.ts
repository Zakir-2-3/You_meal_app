export interface Item {
  id: number;
  instanceId?: string;
  image: string;
  name_ru: string;
  name_en: string;
  price_rub: number;
  size: number;
  count?: number;
}

export interface CartState {
  items: Item[];
  totalPrice: number;
  savedDate: null | string;
}
