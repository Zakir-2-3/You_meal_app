"use client";

import { useEffect, useState } from "react";

import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setTips } from "@/store/slices/tipsSlice";

import { usePriceFormatter } from "@/hooks/cart/usePriceFormatter";
import { useTranslate } from "@/hooks/app/useTranslate";

import { getDiscountedPrice } from "@/utils/cart/getDiscountedPrice";

import { DEFAULT_PROMOS } from "@/constants/user/defaults";

import TotalPriceItemListSkeleton from "@/UI/skeletons/TotalPriceItemListSkeleton";

import "./CartPageCheck.scss";

const CartPageCheck = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { items, savedDate } = useSelector((state: RootState) => state.cart);
  const activated = useSelector((state: RootState) => state.promo.activated);
  const currency = useSelector((state: RootState) => state.currency.currency);
  const selectedTipPercentage = useSelector(
    (s: RootState) => s.tips.percentage,
  );

  const [isLoading, setIsLoading] = useState(() => items.length > 0);

  const { t, lang } = useTranslate();
  const { getConvertedPrice } = usePriceFormatter();

  const {
    subtotal,
    discountTr,
    vatTr,
    total,
    tipsTr,
    thank,
    checkDate,
    checkReceipt,
  } = t.cart;

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
    baseTotalWithVat * selectedTipPercentage,
  );

  // Общая сумма со скидкой, НДС и чаевыми
  const discountedTotalWithTips = baseTotalWithVat + discountedSelectedTip;

  // Форматируем все цены с помощью хука
  const rawTotalFormatted = getConvertedPrice({ price_rub: rawTotal });
  const savedMoneyFormatted = getConvertedPrice({ price_rub: savedMoney });
  const vatFormatted = getConvertedPrice({ price_rub: vat });
  const discountedTotalWithTipsFormatted = getConvertedPrice({
    price_rub: discountedTotalWithTips,
  });

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
      <h3 className="total-price-title">{checkReceipt}</h3>
      <span className="total-price-date">
        {checkDate} {savedDate}
      </span>
      <div className="total-price-item-list">
        {isLoading ? (
          <TotalPriceItemListSkeleton />
        ) : (
          <ul>
            {items.map((item) => {
              const itemTotal = item.price_rub * (item.count ?? 0);
              const itemTotalFormatted = getConvertedPrice({
                price_rub: itemTotal,
              });

              return (
                <li key={item.instanceId}>
                  <span>{item.count}</span>
                  <span>{lang === "ru" ? item.name_ru : item.name_en}</span>
                  <span>{itemTotalFormatted.formattedCurrent}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="total-price-wrapper">
        <p>
          {subtotal}
          <span>{rawTotalFormatted.formattedCurrent}</span>
        </p>
        <p>
          {discountTr}
          {rawTotal > 0 && discountLabels.length > 0
            ? `(${discountLabels.join(",")})`
            : ""}
          <span>
            {savedMoney > 0
              ? `-${savedMoneyFormatted.formattedCurrent}`
              : `0${currency === "rub" ? "₽" : "$"}`}
          </span>
        </p>
        <p>
          {vatTr}(5%)
          <span>
            {vat === 0 ? "" : "+"}
            {vatFormatted.formattedCurrent}
          </span>
        </p>
        <p>
          {total}
          <span>{discountedTotalWithTipsFormatted.formattedCurrent}</span>
        </p>
      </div>
      <p className="total-price-thank">{thank}</p>
      <div className="total-price-tips">
        <p>{tipsTr}</p>
        {[0.05, 0.1, 0.15].map((tip) => {
          const tipBase = activated
            ? baseTotalWithVat
            : roundUp(rawTotal * 1.05);
          const tipAmount = roundUp(tipBase * tip);
          const tipAmountFormatted = getConvertedPrice({
            price_rub: tipAmount,
          });

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
              {tip * 100}% = +{tipAmountFormatted.formattedCurrent}
            </button>
          );
        })}
      </div>
    </>
  );
};

export default CartPageCheck;
