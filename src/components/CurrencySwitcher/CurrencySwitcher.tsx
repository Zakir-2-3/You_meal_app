"use client";

import React, { useState, useRef, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setCurrency } from "@/store/slices/currencySlice";

import "./CurrencySwitcher.scss";

const CurrencySwitcher = () => {
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);

  const currency = useSelector((state: RootState) => state.currency.currency);

  const switcherRef = useRef<HTMLDivElement>(null);

  const handleCurrencyChange = (newCurrency: "rub" | "usd") => {
    dispatch(setCurrency(newCurrency));
    setIsOpen(false);
  };

  const getCurrencyName = (curr: "rub" | "usd") => {
    return curr === "rub" ? "RUB" : "USD";
  };

  const toggleList = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        switcherRef.current &&
        !switcherRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="currency-switcher" ref={switcherRef}>
      <button className="currency-switcher__current" onClick={toggleList}>
        {getCurrencyName(currency)} {currency === "rub" ? "₽" : "$"}
      </button>

      <div
        className={`currency-switcher__arrow ${
          isOpen ? "currency-switcher__arrow--up" : ""
        }`}
        onClick={toggleList}
      >
        ▼
      </div>

      {isOpen && (
        <div className="currency-switcher__dropdown">
          <button
            className="currency-switcher__option"
            onClick={() =>
              handleCurrencyChange(currency === "rub" ? "usd" : "rub")
            }
          >
            {getCurrencyName(currency === "rub" ? "usd" : "rub")}{" "}
            {currency === "rub" ? "$" : "₽"}
          </button>
        </div>
      )}
    </div>
  );
};

export default CurrencySwitcher;
