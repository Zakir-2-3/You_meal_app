"use client";

import { ProductDescriptionProps } from "@/types/components/product/product-description";

const ProductDescription = ({
  description_ru,
  description_en,
  lang,
  translation,
}: ProductDescriptionProps) => {
  return (
    <div className="product-section__info-description">
      <p>{translation}</p>
      <span>{lang === "ru" ? description_ru : description_en}</span>
    </div>
  );
};

export default ProductDescription;
