"use client";

import { FC } from "react";
import Link from "next/link";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

import { categories } from "@/constants/categories";

import { NavButtonsProps } from "@/types/navButtons";

import "./NavButtons.scss";

const NavButtons: FC<NavButtonsProps> = ({ customTitle }) => {
  // Получаем активную категорию
  const activeCategory = useSelector(
    (state: RootState) => state.category.activeIndex
  );

  // Текст в навигации
  const defaultCategoryTitle =
    categories[activeCategory]?.title || "Неизвестно";

  return (
    <nav className="nav-buttons">
      <ol>
        <li>
          <Link href="/">Главная</Link>
        </li>
        <li>{customTitle || defaultCategoryTitle}</li>
      </ol>
    </nav>
  );
};

export default NavButtons;
