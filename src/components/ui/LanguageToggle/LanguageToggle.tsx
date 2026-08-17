"use client";

import React from "react";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { toggleLanguage } from "@/store/slices/languageSlice";

import { STORAGE_LANG } from "@/constants/app/storageKeys";

import "./LanguageToggle.scss";

const LanguageToggle = () => {
  const dispatch = useDispatch<AppDispatch>();
  const current = useSelector((state: RootState) => state.language.current);

  const handleToggle = () => {
    const newLang = current === "ru" ? "en" : "ru";
    dispatch(toggleLanguage());
    localStorage.setItem(STORAGE_LANG, newLang);
  };

  return (
    <div className="lang-toggle" onClick={handleToggle}>
      <div className="lang-toggle__text lang-toggle__text--ru">RU</div>
      <div className="lang-toggle__text lang-toggle__text--en">EN</div>
      <div
        className={`lang-toggle__slider ${
          current === "en" ? "lang-toggle__slider--right" : ""
        }`}
      >
        {current === "ru" ? "RU" : "EN"}
      </div>
    </div>
  );
};

export default LanguageToggle;
