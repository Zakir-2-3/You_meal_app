import { FC, useRef, useCallback, useState, useEffect } from "react";

import Image from "next/image";

import debounce from "lodash.debounce";

import { LottieIcon } from "@/components/ui/LottieIcon";

import { useTranslate } from "@/hooks/app/useTranslate";

import CloseButton from "@/UI/buttons/CloseButton/CloseButton";

import { FoodCategoriesSearchProps } from "@/types/components/product/food-categories-search";

import searchAnimation from "@/assets/animations/search_animation.json";
import searchCloseIcon from "@/assets/icons/search-close-icon.svg";

import "./FoodCategoriesSearch.scss";

const FoodCategoriesSearch: FC<FoodCategoriesSearchProps> = ({
  setSearchValue,
  onSearchToggle,
}) => {
  const [value, setValue] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [searchClick, setSearchClick] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslate();
  const { enterCityGeo } = t.geo;

  // Фокус в инпуте при клике на поиск
  useEffect(() => {
    if (searchClick && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchClick]);

  // Закрытие поиска при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        searchClick
      ) {
        // Закрываем поиск только если поле пустое
        if (!value) {
          setSearchClick(false);
          onSearchToggle?.(false);
        }
        // Если есть текст - оставляем поиск открытым, но убираем фокус
        else {
          inputRef.current?.blur();
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [value, searchClick, onSearchToggle]);

  // Функция очистки поиска
  const onClickClear = () => {
    if (value !== "") {
      setValue("");
      setSearchValue("");
      inputRef.current?.focus();

      // Если поле очищено и поиск был открыт - закрываем его
      setSearchClick(false);
      onSearchToggle?.(false);
    }
  };

  // Задержка поиска товаров через debounce в 600 мс
  const updateSearchValue = useCallback(
    debounce((str) => {
      setSearchValue(str);
    }, 600),
    [],
  );

  // Обработчик изменения input
  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    updateSearchValue(e.target.value);
  };

  // Обработчик клика на кнопке поиска
  const onClickSearch = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!searchClick) {
      setSearchClick(true);
      onSearchToggle?.(true);
    } else {
      // Если есть текст - очищаем, если нет - закрываем поиск
      if (value) {
        onClickClear();
      } else {
        setSearchClick(false);
        onSearchToggle?.(false);
      }
    }
  };

  // Определяем, нужно ли показывать X
  const showCloseIcon = value || searchClick;

  return (
    <div
      className={`food-categories__search ${
        searchClick ? "food-categories__search--active" : ""
      }`}
      ref={searchRef}
    >
      <input
        className="food-categories__search-input"
        onChange={onChangeInput}
        value={value}
        ref={inputRef}
        type="text"
        placeholder={enterCityGeo}
      />
      <CloseButton
        onClick={onClickSearch}
        className={`food-categories__search-button ${
          searchClick ? "food-categories__search-button--active" : ""
        }`}
        ariaLabel={showCloseIcon ? "clear search" : "search"}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        width={24}
        height={24}
      >
        {showCloseIcon ? (
          <Image
            src={searchCloseIcon}
            alt="close-icon"
            width={20}
            height={20}
          />
        ) : (
          <LottieIcon
            animationData={searchAnimation}
            trigger="hover"
            isHovered={isHovered}
            size={27}
          />
        )}
      </CloseButton>
    </div>
  );
};

export default FoodCategoriesSearch;
