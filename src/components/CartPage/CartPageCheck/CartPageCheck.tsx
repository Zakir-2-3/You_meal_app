"use client";

import { useEffect, useState } from "react";

import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setTips } from "@/store/slices/tipsSlice";

import { getDiscountedPrice } from "@/utils/getDiscountedPrice";

import { DEFAULT_PROMOS } from "@/constants/defaults";

import TotalPriceItemListSkeleton from "@/ui/skeletons/TotalPriceItemListSkeleton";

import "./CartPageCheck.scss";

const CartPageCheck = () => {
  const { items, savedDate } = useSelector((state: RootState) => state.cart);
  const activated = useSelector((state: RootState) => state.promo.activated);
  const selectedTipPercentage = useSelector(
    (s: RootState) => s.tips.percentage
  );

  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(() => items.length > 0);

  const roundUp = (num: number) => Math.round(num);

  // Общая сумма без скидок
  const rawTotal = items.reduce((sum, item) => {
    return sum + item.price_rub * (item.count ?? 0);
  }, 0);

  const discountLabels = activated
    .map((code) => {
      if (DEFAULT_PROMOS.includes(code)) {
        if (code === "PromoFirst10") return "10%";
        if (code === "PromoFrom2020" && rawTotal >= 2000) return "20%";
        return null; // дефолтный промокод не подошёл
      }
      return code; // если ручной, показываем его название
    })
    .filter(Boolean);

  // Получаем скидку в процентах
  const { discount } = getDiscountedPrice(activated, rawTotal);

  // Применяем скидку
  const discountedTotal = roundUp(rawTotal * (1 - discount / 100));

  const savedMoney = rawTotal - discountedTotal;

  // НДС
  const vat = roundUp(discountedTotal * 0.05);

  // Чаевые
  const baseTotalWithVat = discountedTotal + vat;
  const discountedSelectedTip = roundUp(
    baseTotalWithVat * selectedTipPercentage
  );

  // Общая сумма со скидкой, НДС и чаевыми
  const discountedTotalWithTips = baseTotalWithVat + discountedSelectedTip;

  useEffect(() => {
    if (items.length > 0) {
      setTimeout(() => setIsLoading(false), 1000);
    }
  }, []);

  useEffect(() => {
    if (rawTotal === 0) {
      dispatch(setTips(0));
    }
  }, [rawTotal, dispatch]);

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
              const itemTotal = item.price_rub * (item.count ?? 0);

              return (
                <li key={item.instanceId}>
                  <span>{item.count}</span>
                  <span>{item.name_ru}</span>
                  <span>{itemTotal}₽</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="total-price-wrapper">
        <p>
          ЧИСТЫЙ СЧЕТ
          <span>{rawTotal}₽</span>
        </p>
        <p>
          СКИДКА
          {discountLabels.length > 0 ? `(${discountLabels.join(",")})` : ""}
          <span>{savedMoney > 0 ? `-${savedMoney}₽` : "0₽"}</span>
        </p>
        <p>
          НДС(5%)
          <span>
            {vat === 0 ? "" : "+"}
            {vat}₽
          </span>
        </p>
        <p>
          ВСЕГО
          <span>{discountedTotalWithTips}₽</span>
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
                dispatch(setTips(selectedTipPercentage === tip ? 0 : tip))
              }
              disabled={rawTotal === 0}
            >
              {tip * 100}% = +{tipAmount}₽
            </button>
          );
        })}
      </div>
    </>
  );
};

export default CartPageCheck;
