import { FC } from "react";

import Image from "next/image";

import { useSelector, useDispatch } from "react-redux";
import { setActiveCategory } from "@/store/slices/category.slice";
import { AppDispatch, RootState } from "@/store/store";

import FoodCategoriesSearch from "../FoodSearch/FoodSearch";

import { categories } from "@/constants/categories";

import "./FoodCategories.scss";

interface FoodCategoriesProps {
  setSearchValue: (value: string) => void;
}

const FoodCategories: FC<FoodCategoriesProps> = ({ setSearchValue }) => {
  const dispatch = useDispatch<AppDispatch>();
  // Активных индекс категории
  const activeIndex = useSelector(
    (state: RootState) => state.category.activeIndex
  );

  return (
    <nav className="food-categories">
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
      <FoodCategoriesSearch setSearchValue={setSearchValue} />
    </nav>
  );
};

export default FoodCategories;
