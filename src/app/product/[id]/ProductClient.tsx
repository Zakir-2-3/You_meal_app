"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import axios from "axios";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { addItem, minusItem, removeItem } from "@/store/slices/cartSlice";
import { setRating, toggleFavorite } from "@/store/slices/productMetaSlice";

import QuantityControl from "@/components/QuantityControl/QuantityControl";
import FavoriteButton from "@/components/FavoriteButton/FavoriteButton";
import RatingStars from "@/components/RatingStars/RatingStars";
import NavButtons from "@/components/NavButtons/NavButtons";

import { getDiscountedPrice } from "@/utils/getDiscountedPrice";

import { useTranslate } from "@/hooks/useTranslate";

import { categories } from "@/constants/categories";

import type { CategoryKey } from "@/types/category";
import { Product } from "@/types/product";

import ProductPageSkeleton from "@/ui/skeletons/ProductPageSkeleton";

import "./productPage.scss";

interface ProductWithOriginal extends Product {
  originalId: string;
  instanceId?: string;
}

export default function ProductClient() {
  const [product, setProduct] = useState<ProductWithOriginal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { id } = useParams();
  const instanceId = String(id); // instanceId ("1-copy-5")

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const meta = useSelector((s: RootState) => s.productMeta);
  const { activeIndex } = useSelector((state: RootState) => state.category);
  const { items } = useSelector((state: RootState) => state.cart);
  const activatedPromos = useSelector(
    (state: RootState) => state.promo.activated
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

  const categoryKey = categories[activeIndex]?.key as CategoryKey | undefined;

  const categoryTitle = categoryKey
    ? (t.categories as Record<CategoryKey, string>)[categoryKey]
    : "Неизвестно";

  const isFav = meta.favorites.includes(instanceId);
  const ratingValue = meta.ratings[instanceId] ?? 0;

  const cartItem = items.find((item) => item.instanceId === instanceId);
  const isAdded = cartItem && (cartItem.count ?? 0) > 0;
  const count = cartItem?.count ?? 0;

  // Парсим originalId для запроса к MockAPI
  let originalId = instanceId;
  if (instanceId.includes("-copy-")) {
    originalId = instanceId.split("-copy-")[0]; // Из "1-copy-5" получаем "1"
  }

  const onClickPlus = () => {
    if (!product) return;

    dispatch(
      addItem({
        id: Number(product.originalId), // Используем originalId для связи с MockAPI
        instanceId: instanceId, // Используем instanceId со страницы
        name_ru: product.name_ru,
        name_en: product.name_en,
        image: product.image,
        price_rub: product.price_rub,
        size: product.size,
      })
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
        })
      );
    }
  };

  // Получаем данные товара
  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      try {
        const { data } = await axios.get<Product>(
          `https://6794c225aad755a134ea56b6.mockapi.io/items/${originalId}`
        );
        // Сохраняем originalId и подменяем id на instanceId
        setProduct({
          ...data,
          id: instanceId, // Подменяем id на instanceId
          originalId: data.id, // Сохраняем originalId из MockAPI
          instanceId: instanceId, // Явно проставляем instanceId
        });
      } catch (error: any) {
        console.log("Ошибка загрузки товара", error);
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
  const discountedPrice = product?.price_rub
    ? Math.round(product.price_rub * (1 - discount / 100))
    : 0;

  return (
    <section className="product-section">
      <div className="container">
        <NavButtons customTitle={categoryTitle} />
        <div className="content-wrapper">
          {product ? (
            <>
              <div
                className="product-section__img"
                style={{ position: "relative" }}
              >
                <div className="product-section__favorite-wrapper">
                  <FavoriteButton
                    active={isFav}
                    onToggle={() => dispatch(toggleFavorite(instanceId))}
                  />
                </div>
                <figure>
                  <Image
                    src={product.image}
                    priority
                    alt={product.name_ru}
                    width={500}
                    height={500}
                  />
                  <figcaption>
                    {lang === "ru" ? product.name_ru : product.name_en}
                    {imageDescription}
                  </figcaption>
                </figure>
              </div>
              <div className="product-section__info">
                <h1 className="product-section__title">
                  {lang === "ru" ? product.name_ru : product.name_en}
                </h1>

                <div className="product-section__info-price">
                  <p>{price}</p>
                  <p>
                    {hasDiscount ? (
                      <>
                        <span className="old-price">{product.price_rub}₽</span>
                        <span className="discounted-price">
                          {discountedPrice}₽
                        </span>
                      </>
                    ) : (
                      `${product.price_rub}₽`
                    )}
                  </p>
                </div>
                <div className="product-section__info-rating">
                  <RatingStars
                    value={ratingValue}
                    onChange={(v) => {
                      if (v !== ratingValue) {
                        dispatch(setRating({ id: instanceId, value: v }));
                      }
                    }}
                  />
                </div>

                <div className="product-section__add-cart">
                  <QuantityControl
                    count={count}
                    onClickPlus={onClickPlus}
                    onClickMinus={onClickMinus}
                  />
                  <button
                    className={`product-section__add-cart-btn ${
                      isAdded ? "product-section__add-cart-btn--delete" : ""
                    }`}
                    onClick={onClickAdd}
                  >
                    {isAdded ? removeFromCart : addToCart}
                  </button>
                </div>
                <div className="product-section__info-description">
                  <p>{descriptionComposition}</p>
                  <span>
                    {lang === "ru"
                      ? product?.description_ru
                      : product?.description_en}
                  </span>
                </div>
                <div className="product-section__info-size">
                  <p>
                    {weightVolume}{" "}
                    <span>
                      {product?.size} {grams}
                    </span>
                  </p>
                </div>
                <div className="product-section__info-nutritional-values">
                  <table>
                    <thead>
                      <tr>
                        <th>{nutritionalValue}</th>
                        <th>{units}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{energy}</td>
                        <td>
                          <span>{product?.energy}</span> {kj}
                        </td>
                      </tr>
                      <tr>
                        <td>{calories}</td>
                        <td>
                          <span>{product?.calories}</span> {kcal}
                        </td>
                      </tr>
                      <tr>
                        <td>{proteins}</td>
                        <td>
                          <span>{product?.proteins}</span> {grams}
                        </td>
                      </tr>
                      <tr>
                        <td>{fats}</td>
                        <td>
                          <span>{product?.fats}</span> {grams}
                        </td>
                      </tr>
                      <tr>
                        <td>{carbohydrates}</td>
                        <td>
                          <span>{product?.carbohydrates}</span> {grams}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <ProductPageSkeleton />
          )}
        </div>
      </div>
    </section>
  );
}
