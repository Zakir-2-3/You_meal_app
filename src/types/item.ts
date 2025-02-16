export interface Item {
  id: number;
  image: string;
  name_ru: string;
  price_rub: number;
  size: number;
  count?: number;
}

export interface CartState {
  items: Item[];
  totalPrice: number;
}
