"use client";

import { useEffect, useState } from "react";

import axios from "axios";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { addItem, minusItem, removeItem } from "@/store/slices/cartSlice";

import NavButtons from "@/components/NavButtons/NavButtons";
import QuantityControl from "@/components/QuantityControl/QuantityControl";

import ProductPageSkeleton from "@/ui/skeletons/ProductPageSkeleton";

import { getDiscountedPrice } from "@/utils/getDiscountedPrice";

import { categories } from "@/constants/categories";

import { Product } from "@/types/product";

import "./productPage.scss";

export default function ProductClient() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Состояние загрузки

  const { id } = useParams(); // Получаем текущий id товара из url
  const parsedId = Number(id); // Преобразуем в число т.к api требует строку
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { activeIndex } = useSelector((state: RootState) => state.category);
  const { items } = useSelector((state: RootState) => state.cart);
  const activatedPromos = useSelector(
    (state: RootState) => state.promo.activated
  );

  // Получаем текущую категорию для NavButtons
  const categoryTitle = categories[activeIndex]?.title || "Неизвестно";
  const cartItem = items.find((item) => item.id === parsedId);
  const isAdded = cartItem && (cartItem.count ?? 0) > 0;
  const count = cartItem?.count ?? 0;

  // Добавить товар в корзину
  const onClickPlus = () => {
    if (!product || parsedId === null) return;

    dispatch(
      addItem({
        id: parsedId,
        name_ru: product.name_ru,
        image: product.image,
        price_rub: product.price_rub,
        size: product.size,
      })
    );
  };

  // Удалить товар из корзины
  const onClickMinus = () => {
    if (parsedId === null) return;
    dispatch(minusItem(parsedId));
  };

  // Логика для добавления/удаления товара из корзины для кнопки
  const onClickAdd = () => {
    if (isAdded) {
      dispatch(removeItem(parsedId)); // Удаляем товар из корзины
    } else {
      dispatch(
        addItem({
          id: parsedId,
          name_ru: product?.name_ru ?? "",
          image: product?.image ?? "",
          price_rub: product?.price_rub ?? 0,
          size: product?.size ?? 0,
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
          `https://6794c225aad755a134ea56b6.mockapi.io/items/${parsedId}`
        );
        setProduct(data);
      } catch (error: any) {
        console.log("Ошибка загрузки товара", error);

        // Если сервер вернул 404, отправляем пользователя на not-found
        if (error.response?.status === 404) {
          router.replace("/not-found");
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [parsedId, router]);

  // Логика расчёта цены с учётом скидки
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
              <div className="product-section__img">
                <figure>
                  <Image
                    src={product.image}
                    priority
                    alt={product.name_ru}
                    width={500}
                    height={500}
                  />
                  <figcaption>
                    {product.name_ru}. Источник фото - burgerking.ru
                  </figcaption>
                </figure>
              </div>
              <div className="product-section__info">
                <h1 className="product-section__title">{product?.name_ru}</h1>
                <div className="product-section__info-price">
                  <p>Цена:</p>
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
                    {isAdded ? "Удалить из корзины" : "Добавить в корзину"}
                  </button>
                </div>
                <div className="product-section__info-description">
                  <p>Описание/состав:</p>
                  <span>{product?.description_ru}</span>
                </div>
                <div className="product-section__info-size">
                  <p>
                    Вес/объём: <span>{product?.size} г.</span>
                  </p>
                </div>
                <div className="product-section__info-nutritional-values">
                  <table>
                    <thead>
                      <tr>
                        <th>Пищевая ценность</th>
                        <th>Единицы</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Энергия</td>
                        <td>
                          <span>{product?.energy}</span> кДж
                        </td>
                      </tr>
                      <tr>
                        <td>Калории</td>
                        <td>
                          <span>{product?.calories}</span> ККал
                        </td>
                      </tr>
                      <tr>
                        <td>Белки</td>
                        <td>
                          <span>{product?.proteins}</span> г
                        </td>
                      </tr>
                      <tr>
                        <td>Жиры</td>
                        <td>
                          <span>{product?.fats}</span> г
                        </td>
                      </tr>
                      <tr>
                        <td>Углеводы</td>
                        <td>
                          <span>{product?.carbohydrates}</span> г
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
