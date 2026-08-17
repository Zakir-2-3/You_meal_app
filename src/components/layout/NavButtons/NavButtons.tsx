"use client";

import { FC, useState, useEffect } from "react";

import { usePathname, useRouter } from "next/navigation";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

import { useTranslate } from "@/hooks/app/useTranslate";

import { categories } from "@/constants/user/categories";

import { NavButtonsProps } from "@/types/components/ui/nav-buttons";

import "./NavButtons.scss";

const NavButtons: FC<NavButtonsProps> = ({ customTitle }) => {
  const { t } = useTranslate();

  const pathname = usePathname();
  const router = useRouter();

  const { homeNav } = t.buttons;

  const [isNavigating, setIsNavigating] = useState(false);

  const activeIndex = useSelector(
    (state: RootState) => state.category.activeIndex,
  );
  const currentCategory = categories[activeIndex];
  const categoryKey = currentCategory?.key as keyof typeof t.categories;
  const translatedCategoryTitle =
    (categoryKey && t.categories[categoryKey]) ||
    currentCategory?.title ||
    t.product.unknownTitleCategory;

  // Сбрасываем блокировку, если путь изменился (навигация завершена)
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  // Дополнительный сброс через 2 секунды, если навигация зависла
  useEffect(() => {
    if (isNavigating) {
      const timer = setTimeout(() => setIsNavigating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isNavigating]);

  if (pathname === "/") return null;

  const goToHome = (category?: string, reset = false) => {
    if (isNavigating) return; // блокируем повторные клики

    setIsNavigating(true);
    if (reset) {
      sessionStorage.setItem("navCategory", "__reset__");
    } else if (category) {
      sessionStorage.setItem("navCategory", category);
    }
    router.push("/");
  };

  return (
    <nav className="nav-buttons">
      <ol>
        <li>
          <button
            onClick={() => goToHome("burgers", true)}
            className="nav-category-btn"
            disabled={isNavigating}
          >
            {homeNav}
          </button>
        </li>
        {translatedCategoryTitle && (
          <li>
            <button
              onClick={() => goToHome(categoryKey)}
              className="nav-category-btn"
              disabled={isNavigating}
            >
              {translatedCategoryTitle}
            </button>
          </li>
        )}
        {customTitle && (
          <li>
            <span>{customTitle}</span>
          </li>
        )}
      </ol>
    </nav>
  );
};

export default NavButtons;
