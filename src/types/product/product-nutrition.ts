export interface ProductNutritionProps {
  product: {
    energy: string | number;
    calories: string | number;
    proteins: string | number;
    fats: string | number;
    carbohydrates: string | number;
  };
  size: string | number;
  lang: "ru" | "en";
  translations: {
    weightVolume: string;
    grams: string;
    nutritionalValue: string;
    units: string;
    energy: string;
    kj: string;
    calories: string;
    kcal: string;
    proteins: string;
    fats: string;
    carbohydrates: string;
  };
}
