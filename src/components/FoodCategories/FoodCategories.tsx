import React, { FC } from "react";
import Image from "next/image";

import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setActiveCategory } from "@/store/slices/categorySlice";

import { categories } from "@/constants/categories";

import "./FoodCategories.scss";

// Оптимизируем категории, чтобы не рендерилась много раз
const FoodCategories: FC = React.memo(() => {
  const dispatch = useDispatch<AppDispatch>();
  const activeIndex = useSelector(
    (state: RootState) => state.category.activeIndex
  );

  return (
    <ul className="food-categories__list">
      {categories.map((item, index) => (
        <li className="food-categories__item" key={item.id}>
          <button
            className={`food-categories__btn ${
              activeIndex === index ? "food-categories__btn--active" : ""
            }`}
            onClick={() =>
              dispatch(setActiveCategory({ index, title: item.title }))
            }
          >
            <Image src={item.image} alt={item.title} width={24} height={24} />
            {item.title}
          </button>
        </li>
      ))}
    </ul>
  );
});

export default FoodCategories;
