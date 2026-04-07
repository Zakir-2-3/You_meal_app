export interface ProductHeaderProps {
  product: {
    name_ru: string;
    name_en: string;
  };
  prices: {
    formattedCurrent: string;
    formattedOld: string | null;
    hasDiscount: boolean;
  };
  ratingValue: number;
  instanceId: string;
  lang: "ru" | "en";
  translations: {
    price: string;
  };
  onRatingChange: (value: number) => void;
}
