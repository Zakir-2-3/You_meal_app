"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { addItem, minusItem, removeItem } from "@/store/slices/cartSlice";
import { setRating, toggleFavorite } from "@/store/slices/productMetaSlice";

import NavButtons from "@/components/layout/NavButtons/NavButtons";
import ProductHeader from "@/components/product/ProductHeader/ProductHeader";
import FavoriteButton from "@/components/product/ProductActions/FavoriteButton";
import ProductActions from "@/components/product/ProductActions/ProductActions";
import ProductDescription from "@/components/product/ProductDescription/ProductDescription";
import ProductImageGallery from "@/components/product/ProductImageGallery/ProductImageGallery";
import ProductNutritionTable from "@/components/product/ProductNutritionTable/ProductNutritionTable";

import { usePriceFormatter } from "@/hooks/cart/usePriceFormatter";
import { useTranslate } from "@/hooks/app/useTranslate";

import { getDiscountedPrice } from "@/utils/cart/getDiscountedPrice";

import { Product } from "@/types/product/product";
import { ProductWithOriginal } from "@/types/product/product-with-original";

import ProductPageSkeleton from "@/UI/skeletons/ProductPageSkeleton";

import "./page.scss";

export default function ProductClient() {
  const [product, setProduct] = useState<ProductWithOriginal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { id } = useParams();
  const instanceId = String(id);
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();

  const meta = useSelector((s: RootState) => s.productMeta);
  const { items } = useSelector((state: RootState) => state.cart);
  const activatedPromos = useSelector(
    (state: RootState) => state.promo.activated,
  );

  const { t, lang } = useTranslate();

  const {
    imageDescription,
    price,
    descriptionComposition,
    weightVolume,
    grams,
    nutritionalValue,
    units,
    energy,
    kj,
    calories,
    kcal,
    proteins,
    fats,
    carbohydrates,
  } = t.product;

  const { addToCart, removeFromCart } = t.buttons;

  const { getConvertedPrice } = usePriceFormatter();

  const isFav = meta.favorites.includes(instanceId);
  const ratingValue = meta.ratings[instanceId] ?? 0;

  const cartItem = items.find((item) => item.instanceId === instanceId);
  const isAdded = cartItem && (cartItem.count ?? 0) > 0;
  const count = cartItem?.count ?? 0;

  // Парсим originalId для запроса к MockAPI
  let originalId = instanceId;
  if (instanceId.includes("-copy-")) {
    originalId = instanceId.split("-copy-")[0];
  }

  const handleToggleFavorite = useCallback(() => {
    dispatch(toggleFavorite(instanceId));
  }, [dispatch, instanceId]);

  const onClickPlus = () => {
    if (!product) return;

    dispatch(
      addItem({
        id: Number(product.originalId),
        instanceId: instanceId,
        name_ru: product.name_ru,
        name_en: product.name_en,
        image: product.image,
        price_rub: product.price_rub,
        size: product.size,
      }),
    );
  };

  const onClickMinus = () => {
    dispatch(minusItem(instanceId));
  };

  const onClickAdd = () => {
    if (!product) return;

    if (isAdded) {
      dispatch(removeItem(instanceId));
    } else {
      dispatch(
        addItem({
          id: Number(product.originalId),
          instanceId: instanceId,
          name_ru: product.name_ru,
          name_en: product.name_en,
          image: product.image,
          price_rub: product.price_rub,
          size: product.size,
        }),
      );
    }
  };

  // Загрузка данных товара
  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      try {
        const { data } = await axios.get<Product>(
          `https://6794c225aad755a134ea56b6.mockapi.io/items/${originalId}`,
        );
        setProduct({
          ...data,
          id: instanceId,
          originalId: data.id,
          instanceId: instanceId,
          price_usd: (data as any).price_usd,
        });
      } catch (error: any) {
        console.log("Product loading error", error);
        if (error.response?.status === 404) {
          router.replace("/not-found");
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [originalId, instanceId, router]);

  const { discount, hasDiscount } = product
    ? getDiscountedPrice(activatedPromos, product.price_rub)
    : { discount: 0, hasDiscount: false };

  const prices = product
    ? getConvertedPrice(
        {
          price_rub: product.price_rub,
          price_usd: product.price_usd,
        },
        discount,
      )
    : {
        formattedCurrent: "",
        formattedOld: null,
        hasDiscount: false,
      };

  if (isLoading) {
    return <ProductPageSkeleton />;
  }

  if (!product) {
    return null;
  }

  return (
    <section className="product-section">
      <div className="container">
        <NavButtons />

        <div className="content-wrapper">
          <div className="product-section__img">
            <FavoriteButton isFav={isFav} onToggle={handleToggleFavorite} />

            <figure>
              <ProductImageGallery
                images={[
                  product.image,
                  product.image,
                  product.image,
                  product.image,
                ]}
                alt={product.name_ru}
              />
              <figcaption>
                {lang === "ru" ? product.name_ru : product.name_en}
                {imageDescription}
              </figcaption>
            </figure>
          </div>

          <div className="product-section__info">
            <ProductHeader
              product={product}
              prices={prices}
              ratingValue={ratingValue}
              instanceId={instanceId}
              lang={lang}
              translations={{ price }}
              onRatingChange={(value) =>
                dispatch(setRating({ id: instanceId, value }))
              }
            />

            <ProductActions
              count={count}
              isAdded={!!isAdded}
              instanceId={instanceId}
              onClickPlus={onClickPlus}
              onClickMinus={onClickMinus}
              onClickAdd={onClickAdd}
              translations={{ addToCart, removeFromCart }}
            />

            <ProductDescription
              description_ru={product.description_ru}
              description_en={product.description_en}
              lang={lang}
              translation={descriptionComposition}
            />

            <ProductNutritionTable
              product={{
                energy: product.energy,
                calories: product.calories,
                proteins: product.proteins,
                fats: product.fats,
                carbohydrates: product.carbohydrates,
              }}
              size={product.size}
              lang={lang}
              translations={{
                weightVolume,
                grams,
                nutritionalValue,
                units,
                energy,
                kj,
                calories,
                kcal,
                proteins,
                fats,
                carbohydrates,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
