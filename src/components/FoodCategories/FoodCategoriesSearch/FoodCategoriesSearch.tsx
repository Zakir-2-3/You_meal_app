import { FC, useRef, useCallback, useState } from "react";

import debounce from "lodash.debounce";

import Image from "next/image";

import "./FoodCategoriesSearch.scss";

import searchIcon from "@/assets/icons/search-icon.svg";
import searchCloseIcon from "@/assets/icons/search-close-icon.svg";

interface FoodCategoriesSearchProps {
  setSearchValue: (value: string) => void;
}

const FoodCategoriesSearch: FC<FoodCategoriesSearchProps> = ({
  setSearchValue,
}) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const onClickClear = () => {
    setSearchValue("");
    setValue("");
    inputRef.current.focus();
  };

  const updateSearchValue = useCallback(
    debounce((str) => {
      setSearchValue(str);
    }, 350),
    []
  );

  const onChangeInput = (e) => {
    setValue(e.target.value);
    updateSearchValue(e.target.value);
  };

  return (
    <div className="food-categories__search">
      <input
        className="food-categories__search-input"
        onChange={onChangeInput}
        value={value}
        ref={inputRef}
        type="text"
        placeholder="Найти..."
      />
      <button className="food-categories__search-button" onClick={onClickClear}>
        <Image
          src={value ? searchCloseIcon : searchIcon}
          alt="Поиск"
          width={15}
          height={15}
        />
      </button>
    </div>
  );
};

export default FoodCategoriesSearch;
