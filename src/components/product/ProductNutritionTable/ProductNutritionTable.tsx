"use client";

import { ProductNutritionProps } from "@/types/product/product-nutrition";

const ProductNutritionTable = ({
  product,
  size,
  translations,
}: ProductNutritionProps) => {
  return (
    <>
      <div className="product-section__info-size">
        <p>
          {translations.weightVolume}{" "}
          <span>
            {size} {translations.grams}
          </span>
        </p>
      </div>
      <div className="product-section__info-nutritional-values">
        <table>
          <thead>
            <tr>
              <th>{translations.nutritionalValue}</th>
              <th>{translations.units}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{translations.energy}</td>
              <td>
                <span>{product.energy}</span> {translations.kj}
              </td>
            </tr>
            <tr>
              <td>{translations.calories}</td>
              <td>
                <span>{product.calories}</span> {translations.kcal}
              </td>
            </tr>
            <tr>
              <td>{translations.proteins}</td>
              <td>
                <span>{product.proteins}</span> {translations.grams}
              </td>
            </tr>
            <tr>
              <td>{translations.fats}</td>
              <td>
                <span>{product.fats}</span> {translations.grams}
              </td>
            </tr>
            <tr>
              <td>{translations.carbohydrates}</td>
              <td>
                <span>{product.carbohydrates}</span> {translations.grams}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ProductNutritionTable;
