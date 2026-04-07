import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

import { useExchangeRate } from "../common/useExchangeRate";

import { PriceData, FormattedPrice } from "@/types/hooks/use-price-formatter";

export const usePriceFormatter = () => {
  const currency = useSelector((state: RootState) => state.currency.currency);
  const {
    rate,
    loading: rateLoading,
    error: rateError,
  } = useExchangeRate(currency);
  const activated = useSelector((state: RootState) => state.promo.activated);

  const formatPrice = (value: number, currency: "rub" | "usd"): string => {
    if (currency === "rub") {
      return `${Math.round(value)}₽`;
    }
    return `${(Math.round(value * 100) / 100).toFixed(2)}$`;
  };

  const getConvertedPrice = (
    priceData: PriceData,
    discount: number = 0,
  ): FormattedPrice => {
    const { price_rub, price_usd } = priceData;
    const discountedPriceRub = Math.round(price_rub * (1 - discount / 100));

    if (currency === "rub") {
      return {
        current: discountedPriceRub,
        old: discount > 0 ? price_rub : null,
        formattedCurrent: formatPrice(discountedPriceRub, "rub"),
        formattedOld: discount > 0 ? formatPrice(price_rub, "rub") : null,
        hasDiscount: discount > 0,
        isLoading: false,
      };
    }

    // Для долларов - используем статичную цену только если есть ошибка
    if (rateError) {
      // API недоступен - используем статичную цену из mockapi
      const staticPriceUSD = price_usd || price_rub / 90;
      return {
        current: staticPriceUSD,
        old: null,
        formattedCurrent: formatPrice(staticPriceUSD, "usd"),
        formattedOld: null,
        hasDiscount: false,
        isLoading: false,
      };
    }

    // Если курс загружен - конвертируем
    if (rate && rate > 0) {
      const currentUSD = discountedPriceRub / rate;
      const oldUSD = discount > 0 ? price_rub / rate : null;

      return {
        current: currentUSD,
        old: oldUSD,
        formattedCurrent: formatPrice(currentUSD, "usd"),
        formattedOld: oldUSD ? formatPrice(oldUSD, "usd") : null,
        hasDiscount: discount > 0,
        isLoading: false,
      };
    }

    // Загрузка курса - показываем цену в рублях
    return {
      current: discountedPriceRub,
      old: discount > 0 ? price_rub : null,
      formattedCurrent: formatPrice(discountedPriceRub, "rub"),
      formattedOld: discount > 0 ? formatPrice(price_rub, "rub") : null,
      hasDiscount: discount > 0,
      isLoading: true,
    };
  };

  return {
    currency,
    formatPrice,
    getConvertedPrice,
    rate,
    activated,
  };
};
