"use client";

import { useEffect } from "react";

import { useDispatch } from "react-redux";
import { clearTips } from "@/store/slices/tipsSlice";

import { useTranslate } from "@/hooks/app/useTranslate";
import { usePriceFormatter } from "@/hooks/cart/usePriceFormatter";

import TotalPriceItemListSkeleton from "@/UI/skeletons/TotalPriceItemListSkeleton";

import { CartPageCheckProps } from "@/types/components/product/cart-page";

import "./CartPageCheck.scss";

const CartPageCheck = ({
  enrichedItems,
  savedDate,
  rawTotal,
  discountLabels,
  savedMoney,
  vat,
  baseTotalWithVat,
  selectedTipPercentage,
  discountedTotalWithTips,
  onTipChange,
  isLoading,
}: CartPageCheckProps) => {
  const { t } = useTranslate();

  const { getConvertedPrice } = usePriceFormatter();

  const dispatch = useDispatch();

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

  // Форматируем все суммы
  const rawTotalFormatted = getConvertedPrice({ price_rub: rawTotal });
  const savedMoneyFormatted = getConvertedPrice({ price_rub: savedMoney });
  const vatFormatted = getConvertedPrice({ price_rub: vat });
  const discountedTotalWithTipsFormatted = getConvertedPrice({
    price_rub: discountedTotalWithTips,
  });
  const zeroFormatted = getConvertedPrice({ price_rub: 0 });

  useEffect(() => {
    if (rawTotal === 0) {
      dispatch(clearTips());
    }
  }, [rawTotal, dispatch]);

  return (
    <>
      <h3 className="total-price-title">{checkReceipt}</h3>
      <span className="total-price-date">
        {enrichedItems.length > 0 ? `${checkDate} ${savedDate}` : checkDate}
      </span>
      <div className="total-price-item-list">
        {isLoading ? (
          <TotalPriceItemListSkeleton />
        ) : (
          <ul>
            {enrichedItems.map((item) => {
              const itemTotal = item.price_rub * (item.count ?? 0);
              const itemTotalFormatted = getConvertedPrice({
                price_rub: itemTotal,
              });

              return (
                <li key={item.instanceId}>
                  <span>{item.count}</span>
                  <span>{item.name}</span>
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
        <p className="discount-row">
          <span className="discount-label">
            {discountTr}
            {rawTotal > 0 && discountLabels.length > 0 ? (
              <>
                (
                <span className="discount-codes">
                  {discountLabels.join(",")}
                </span>
                )
              </>
            ) : (
              ""
            )}
          </span>
          <span className="discount-value">
            {savedMoney > 0
              ? `-${savedMoneyFormatted.formattedCurrent}`
              : zeroFormatted.formattedCurrent}
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
          const tipBase = rawTotal > 0 ? baseTotalWithVat : 0;
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
                onTipChange(selectedTipPercentage === tip ? 0 : tip)
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
