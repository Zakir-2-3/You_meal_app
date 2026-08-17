"use client";

import { useState, useEffect, useMemo, useRef } from "react";

import axios from "axios";
import { toast } from "react-toastify";

import { useTranslate } from "../app/useTranslate";

import { getDiscountedPrice } from "@/utils/cart/getDiscountedPrice";

import { DEFAULT_PROMOS } from "@/constants/user/defaults";

import { CartItem } from "@/types/product/item";
import { EnrichedCartItem, UseCartItemsReturn } from "@/types/hooks/cart-items";

export const useCartItems = (
  items: CartItem[],
  activated: string[],
  tipsPercent: number,
  lang: "ru" | "en",
): UseCartItemsReturn => {
  const [productMap, setProductMap] = useState<
    Map<
      string,
      {
        price_rub: number;
        price_usd: number;
        name_ru: string;
        name_en: string;
        image: string;
        size: number;
      }
    >
  >(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslate();
  const errorToastShown = useRef(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get<any[]>(
          "https://6794c225aad755a134ea56b6.mockapi.io/items",
        );
        const map = new Map<
          string,
          {
            price_rub: number;
            price_usd: number;
            name_ru: string;
            name_en: string;
            image: string;
            size: number;
          }
        >();
        res.data.forEach((product) => {
          map.set(String(product.id), {
            price_rub: product.price_rub,
            price_usd: product.price_usd ?? 0,
            name_ru: product.name_ru,
            name_en: product.name_en,
            image: product.image,
            size: product.size,
          });
        });
        setProductMap(map);
        errorToastShown.current = false;
      } catch (error) {
        console.error("Failed to load products for cart", error);
        if (!errorToastShown.current) {
          toast.error(t.toastTr.dataLoadError);
          errorToastShown.current = true;
        }
        // Очищаем productMap при ошибке, чтобы enrichedItems стал пустым
        setProductMap(new Map());
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const roundUp = (num: number) => Math.round(num);

  const { enrichedItems, rawTotal, rawTotalUSD } = useMemo(() => {
    if (productMap.size === 0) {
      return { enrichedItems: [], rawTotal: 0, rawTotalUSD: 0 };
    }

    let total = 0;
    let totalUSD = 0;
    const enriched = items.map((item) => {
      const product = productMap.get(String(item.id));
      const price_rub = product?.price_rub ?? 0;
      const price_usd = product?.price_usd ?? 0;
      const name =
        lang === "ru" ? (product?.name_ru ?? "") : (product?.name_en ?? "");
      const image = product?.image ?? "";
      const size = product?.size ?? 0;
      const count = item.count ?? 0;
      total += price_rub * count;
      totalUSD += price_usd * count;

      return {
        id: String(item.id),
        instanceId: item.instanceId ?? String(item.id),
        name,
        name_ru: product?.name_ru ?? "",
        name_en: product?.name_en ?? "",
        image,
        size,
        count,
        price_rub,
        price_usd,
      } satisfies EnrichedCartItem;
    });

    return { enrichedItems: enriched, rawTotal: total, rawTotalUSD: totalUSD };
  }, [items, productMap, lang]);

  const { discount, hasDiscount } = getDiscountedPrice(activated, rawTotal);
  const discountedTotal = roundUp(rawTotal * (1 - discount / 100));
  const savedMoney = rawTotal - discountedTotal;

  // Для долларов без округления до целого, оставляем точность
  const discountedTotalUSD = rawTotalUSD * (1 - discount / 100);
  const savedMoneyUSD = rawTotalUSD - discountedTotalUSD;

  const vat = roundUp(discountedTotal * 0.05);
  const baseTotalWithVat = discountedTotal + vat;
  const discountedSelectedTip = roundUp(baseTotalWithVat * tipsPercent);
  const discountedTotalWithTips = baseTotalWithVat + discountedSelectedTip;

  const discountLabels = useMemo(() => {
    return activated
      .map((code) => {
        if (DEFAULT_PROMOS.includes(code)) {
          if (code === "PromoFirst10") return "10%";
          if (code === "PromoFrom2020" && rawTotal >= 2000) return "20%";
          return null;
        }
        return code;
      })
      .filter(Boolean) as string[];
  }, [activated, rawTotal]);

  return {
    enrichedItems,
    isLoading,
    rawTotal,
    rawTotalUSD,
    discount,
    hasDiscount,
    discountLabels,
    savedMoney,
    savedMoneyUSD,
    vat,
    baseTotalWithVat,
    discountedTotalWithTips,
    tipsAmount: discountedSelectedTip,
  };
};
