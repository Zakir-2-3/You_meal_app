"use client";

import { FC } from "react";

import Link from "next/link";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

import { categories } from "@/constants/categories";

import { useTranslate } from "@/hooks/useTranslate";

import { NavButtonsProps } from "@/types/navButtons";

import "./NavButtons.scss";

const NavButtons: FC<NavButtonsProps> = ({ customTitle }) => {
  const { t } = useTranslate();

  const { homeNav } = t.buttons;

  const activeCategory = useSelector(
    (state: RootState) => state.category.activeIndex
  );

  // Текущая категория
  const currentCategory = categories[activeCategory];

  // Берем ключ категории
  const categoryKey = currentCategory?.key as keyof typeof t.categories;

  // Если есть перевод, берем его, иначе оригинал
  const translatedCategoryTitle =
    (categoryKey && t.categories[categoryKey]) ||
    currentCategory?.title ||
    "Неизвестно";

  // Текст для навигации
  const navTitle = customTitle || translatedCategoryTitle;

  return (
    <nav className="nav-buttons">
      <ol>
        <li>
          <Link href="/">{homeNav}</Link>
        </li>
        <li>{navTitle}</li>
      </ol>
    </nav>
  );
};

export default NavButtons;
