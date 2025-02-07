import { FC } from "react";

import FoodCategoriesSearch from "./FoodCategoriesSearch/FoodCategoriesSearch";

import Image from "next/image";

import "./FoodCategories.scss";

import category_1 from "@/assets/icons/food-icon-1.png";
import category_2 from "@/assets/icons/food-icon-2.png";
import category_3 from "@/assets/icons/food-icon-3.png";
import category_4 from "@/assets/icons/food-icon-4.png";
import category_5 from "@/assets/icons/food-icon-5.png";
import category_6 from "@/assets/icons/food-icon-6.png";
import category_7 from "@/assets/icons/food-icon-7.png";
import category_8 from "@/assets/icons/food-icon-8.png";

interface FoodCategoriesProps {
  activeIndex: number;
  setSearchValue: (value: string) => void;
  onButtonClick: (index: number, title: string) => void;
}

const items = [
  { id: 1, title: "Бургеры", image: category_1 },
  { id: 2, title: "Закуски", image: category_2 },
  { id: 3, title: "Комбо", image: category_3 },
  { id: 4, title: "Шаурма", image: category_4 },
  { id: 5, title: "Завтраки", image: category_5 },
  { id: 6, title: "Напитки", image: category_6 },
  { id: 7, title: "Десерты", image: category_7 },
  { id: 8, title: "Соусы", image: category_8 },
];

const FoodCategories: FC<FoodCategoriesProps> = ({
  activeIndex,
  onButtonClick,
  setSearchValue,
}) => {
  return (
    <nav className="food-categories">
      <ul className="food-categories__list">
        {items.map((item, index) => (
          <li className="food-categories__item" key={item.id}>
            <button
              className={`food-categories__btn ${
                activeIndex === index ? "food-categories__btn--active" : ""
              }`}
              onClick={() => onButtonClick(index, item.title)}
            >
              <Image src={item.image} alt={item.title} width={24} height={24} />
              {item.title}
            </button>
          </li>
        ))}
      </ul>
      <FoodCategoriesSearch
        setSearchValue={setSearchValue}
      />
    </nav>
  );
};

export default FoodCategories;
