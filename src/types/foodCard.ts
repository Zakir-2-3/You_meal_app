export interface FoodCardProps {
  id: number;
  image: string;
  name_ru: string;
  name_en: string;
  price_rub: number;
  price_usd?: number;
  size: number;
  instanceId?: string;
}
