"use client";

import { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

import { getDiscountedPrice } from "@/utils/getDiscountedPrice";

import TotalPriceItemListSkeleton from "@/ui/skeletons/TotalPriceItemListSkeleton";
import "./CartPageCheck.scss";

const CartPageCheck: FC = () => {
  const { items, savedDate } = useSelector((state: RootState) => state.cart);
  const activated = useSelector((state: RootState) => state.promo.activated);

  const [selectedTipPercentage, setSelectedTipPercentage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(() => items.length > 0);

  const roundUp = (num: number) => Math.round(num);

  // Общая сумма без скидок
  const rawTotal = items.reduce((sum, item) => {
    return sum + item.price_rub * (item.count ?? 0);
  }, 0);

  // Получаем скидку в процентах
  const { discount } = getDiscountedPrice(activated, rawTotal);

  // Применяем скидку
  const discountedTotal = roundUp(rawTotal * (1 - discount / 100));

  // НДС
  const vat = roundUp(discountedTotal * 0.05);

  // Чаевые
  const baseTotalWithVat = discountedTotal + vat;
  const discountedSelectedTip = roundUp(
    baseTotalWithVat * selectedTipPercentage
  );

  // Общая сумма со скидкой, НДС и чаевыми
  const discountedTotalWithTips = baseTotalWithVat + discountedSelectedTip;

  // Альтернативная сумма (если без скидки)
  const totalWithTips = roundUp(
    rawTotal * 1.05 + rawTotal * selectedTipPercentage
  );

  useEffect(() => {
    if (items.length > 0) {
      setTimeout(() => setIsLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    if (rawTotal === 0) {
      setSelectedTipPercentage(0);
    }
  }, [rawTotal]);

  return (
    <>
      <h3 className="total-price-title">YourMeal Check</h3>
      <span className="total-price-date">Дата: {savedDate}</span>
      <div className="total-price-item-list">
        {isLoading ? (
          <TotalPriceItemListSkeleton />
        ) : (
          <ul>
            {items.map((item) => {
              const totalPrice = item.price_rub * (item.count ?? 0);
              return (
                <li key={item.id}>
                  <span>{item.count}</span>
                  <span>{item.name_ru}</span>
                  <span>{roundUp(totalPrice)}₽</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="total-price-wrapper">
        <p>
          ЧИСТЫЙ СЧЕТ
          <span>{discountedTotal}₽</span>
        </p>
        <p>
          НДС (5%)
          <span>{vat}₽</span>
        </p>
        <p>
          ВСЕГО
          <span>
            {activated ? (
              <>
                {items.length > 0 && (
                  <span className="old-price">{totalWithTips}₽</span>
                )}
                <span className="discounted-price">
                  {discountedTotalWithTips}₽
                </span>
              </>
            ) : (
              `${totalWithTips}₽`
            )}
          </span>
        </p>
      </div>
      <p className="total-price-thank">THANK YOU FOR VISITING!</p>
      <div className="total-price-tips">
        <p>ЧАЕВЫЕ</p>
        {[0.05, 0.1, 0.15].map((tip) => {
          const tipBase = activated
            ? baseTotalWithVat
            : roundUp(rawTotal * 1.05);
          const tipAmount = roundUp(tipBase * tip);

          return (
            <button
              key={tip}
              className={`tip-option ${
                selectedTipPercentage === tip ? "tip-option--active" : ""
              }`}
              onClick={() =>
                setSelectedTipPercentage((prev) => (prev === tip ? 0 : tip))
              }
              disabled={rawTotal === 0}
            >
              {tip * 100}% = {tipAmount}₽
            </button>
          );
        })}
      </div>
    </>
  );
};

export default CartPageCheck;
