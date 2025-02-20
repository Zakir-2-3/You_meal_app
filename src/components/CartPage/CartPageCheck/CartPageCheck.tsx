"use client";

import { FC, useState } from "react";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

import TotalPriceItemListSkeleton from "../../ui/skeletons/TotalPriceItemListSkeleton";

import "./CartPageCheck.scss";

const CartPageCheck: FC = () => {
  // Получаем общую сумму, массив добавленных, первую дату в товара
  const { totalPrice, items, savedDate } = useSelector(
    (state: RootState) => state.cart
  );
  const [selectedTip, setSelectedTip] = useState<number>(0); // Храним выбранные чаевые
  const totalWithTips = totalPrice + totalPrice * 0.05 + selectedTip; // Подсчет общей суммы с чаевыми

  const handleTipSelect = (tip: number) => {
    setSelectedTip((prev) => (prev === tip ? 0 : tip)); // Сбрасываем при повторном клике
  };

  return (
    <>
      <h3 className="total-price-title">YourMeal Check</h3>
      <span className="total-price-date">Дата: {savedDate}</span>
      <div className="total-price-item-list">
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <span>{item.count}</span>
              <span>{item.name_ru}</span>
              <span>
                {new Intl.NumberFormat("ru-RU").format(
                  item.price_rub * (item.count ?? 0)
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="total-price-wrapper">
        <p>
          СЧЕТ (БЕЗ НДС)
          <span>
            {new Intl.NumberFormat("ru-RU").format(
              parseFloat(totalPrice.toFixed(2))
            )}{" "}
            ₽
          </span>
        </p>
        <p>
          НДС (5%)
          <span>
            {new Intl.NumberFormat("ru-RU")
              .format(parseFloat((totalPrice * 0.05).toFixed(2)))
              .replace(",", ".")}{" "}
            ₽
          </span>
        </p>
        <p>
          ВСЕГО
          <span>
            {new Intl.NumberFormat("ru-RU")
              .format(parseFloat(totalWithTips.toFixed(2)))
              .replace(",", ".")}{" "}
            ₽
          </span>
        </p>
      </div>
      <p className="total-price-thank">THANK YOU FOR VISITING!</p>
      <div className="total-price-tips">
        <p>ЧАЕВЫЕ</p>
        {[0.05, 0.1, 0.15].map((tip) => (
          <button
            key={tip}
            className={`tip-option ${
              selectedTip === totalPrice * tip ? "tip-option--active" : ""
            }`}
            onClick={() => handleTipSelect(totalPrice * tip)}
          >
            {tip * 100}% ={" "}
            {new Intl.NumberFormat("ru-RU")
              .format(parseFloat((totalPrice * tip).toFixed(2)))
              .replace(",", ".")}
            ₽
          </button>
        ))}
      </div>
    </>
  );
};

export default CartPageCheck;
