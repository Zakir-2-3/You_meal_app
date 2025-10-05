import { FC, useRef, useCallback, useState, useEffect } from "react";

import Image from "next/image";

import debounce from "lodash.debounce";

import searchIcon from "@/assets/icons/search-icon.svg";
import searchCloseIcon from "@/assets/icons/search-close-icon.svg";

import "./FoodCategoriesSearch.scss";

interface FoodCategoriesSearchProps {
  setSearchValue: (value: string) => void;
}

const FoodCategoriesSearch: FC<FoodCategoriesSearchProps> = ({
  setSearchValue,
}) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [searchClick, setSearchClick] = useState(false);

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
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchClick(false); // Закрываем поиск
        if (value) onClickClear(); // Очищаем только если был активен поиск
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [value]); // Добавляем зависимость от value, чтобы не очищать лишний раз

  // Функция очистки поиска
  const onClickClear = () => {
    if (value !== "") {
      setValue(""); // Очищаем input
      setSearchValue(""); // Сбрасываем значение в родительском компоненте
      inputRef.current?.focus(); // Фокус при очистки текста
    }
  };

  // Задержка поиска товаров через debounce в 450 мс
  const updateSearchValue = useCallback(
    debounce((str) => {
      setSearchValue(str);
    }, 450),
    []
  );

  // Обработчик изменения input
  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    updateSearchValue(e.target.value);
  };

  // Обработчик клика на кнопке поиска
  const onClickSearch = () => {
    if (!searchClick) {
      setSearchClick(true); // Открываем поиск
    } else {
      onClickClear(); // Если поиск уже открыт, очищаем поле
    }
  };

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
        placeholder="Найти"
      />
      <button
        className="food-categories__search-button"
        onClick={onClickSearch}
      >
        <Image
          src={value || searchClick ? searchCloseIcon : searchIcon}
          alt="Поиск"
          width={20}
          height={20}
        />
      </button>
    </div>
  );
};

export default FoodCategoriesSearch;
