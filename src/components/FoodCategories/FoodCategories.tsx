"use client";

import React, { FC } from "react";
import Image from "next/image";

import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setActiveCategory } from "@/store/slices/categorySlice";

import { categories } from "@/constants/categories";

import { useTranslate } from "@/hooks/useTranslate";

import type { CategoryKey } from "@/types/category";

import "./FoodCategories.scss";

const FoodCategories: FC = React.memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const activeIndex = useSelector(
    (state: RootState) => state.category.activeIndex
  );

  const { t } = useTranslate();

  return (
    <ul className="food-categories__list">
      {categories.map((item, index) => {
        const key = item.key as CategoryKey;
        const translatedTitle =
          (t.categories as Record<CategoryKey, string>)[key] ??
          item.title ??
          "";

        return (
          <li className="food-categories__item" key={item.id}>
            <button
              className={`food-categories__btn ${
                activeIndex === index ? "food-categories__btn--active" : ""
              }`}
              onClick={() =>
                dispatch(setActiveCategory({ index, key: item.key }))
              }
            >
              <Image
                src={item.image}
                alt={translatedTitle}
                width={24}
                height={24}
              />
              {translatedTitle}
            </button>
          </li>
        );
      })}
    </ul>
  );
});

export default FoodCategories;
