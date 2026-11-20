"use client";

import { useCallback, useEffect, useState, useRef } from "react";

import { useParams, useRouter } from "next/navigation";

import axios from "axios";
import { toast } from "react-toastify";

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

import ProductPageSkeleton from "@/UI/skeletons/ProductPageSkeleton";
import LoadingSpinner from "@/UI/loaders/LoadingSpinner";

import { ProductWithOriginal } from "@/types/product/product-with-original";
import { Product } from "@/types/product/product";

import "./page.scss";

export default function ProductClient() {
  const [product, setProduct] = useState<ProductWithOriginal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const toastShown = useRef(false);

  const { id } = useParams();
  const instanceId = String(id);
  const router = useRouter();

  const dispatch = useDispatch<AppDispatch>();

  const meta = useSelector((state: RootState) => state.productMeta);
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
    nothingFound,
  } = t.product;

  const { addToCart, removeFromCart, addToCartShort, removeFromCartShort } =
    t.buttons;

  const { getConvertedPrice } = usePriceFormatter();

  const isFav = meta.favorites.includes(instanceId);
  const ratingValue = meta.ratings[instanceId] ?? 0;

  const cartItem = items.find((item) => item.instanceId === instanceId);
  const isAdded = cartItem && (cartItem.count ?? 0) > 0;
  const count = cartItem?.count ?? 0;

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
        id: String(product.originalId),
        instanceId: instanceId,
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
          id: String(product.originalId),
          instanceId,
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
        toastShown.current = false; // сброс при успехе
      } catch (error: any) {
        if (error.response?.status === 404) {
          router.replace("/not-found");
        } else {
          setHasError(true);
          if (!toastShown.current) {
            toast.error(t.toastTr.dataLoadError);
            toastShown.current = true;
          }
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [originalId, instanceId, router]);

  const { discount } = product
    ? getDiscountedPrice(activatedPromos, product.price_rub)
    : { discount: 0 };

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

  return (
    <section className="product-section">
      <div className="container">
        <NavButtons />

        {isLoading ? (
          <>
            <ProductPageSkeleton />
            <div className="overlay-loading" />
            <div className="overlay-spinner">
              <LoadingSpinner />
            </div>
          </>
        ) : hasError || !product ? (
          <div className="content-wrapper content-wrapper--error">
            <p className="food-section__empty">
              <b>¯\_(ツ)_/¯</b>
              <br /> {nothingFound}
            </p>
          </div>
        ) : (
          <div className="content-wrapper">
            <div className="product-section__img">
              <figure>
                <ProductImageGallery
                  images={[
                    product.image,
                    product.image,
                    product.image,
                    product.image,
                    product.image,
                    product.image,
                    product.image,
                    product.image,
                  ]}
                  alt={product.name_ru}
                />
                <FavoriteButton isFav={isFav} onToggle={handleToggleFavorite} />
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
                translations={{
                  addToCart,
                  removeFromCart,
                  addToCartShort,
                  removeFromCartShort,
                }}
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
        )}
      </div>
    </section>
  );
}
