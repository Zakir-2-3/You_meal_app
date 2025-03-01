"use client";

import axios from "axios";
import Image from "next/image";
import { useParams } from "next/navigation";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { addItem, minusItem, removeItem } from "@/store/slices/cart.slice";

import { useEffect, useState } from "react";

import NavButtons from "@/components/NavButtons/NavButtons";
import QuantityControl from "@/components/QuantityControl/QuantityControl";
import ProductPageSkeleton from "@/ui/skeletons/ProductPageSkeleton";

import { categories } from "@/constants/categories";
import { Product } from "@/types/product";

import "./productPage.scss";

export default function ProductClient() {
  const [product, setProduct] = useState<Product | null>(null);

  const { id } = useParams(); // Получаем текущий id товара из url
  const parsedId = Number(id); // Преобразуем в число т.к api требует строку

  const dispatch = useDispatch<AppDispatch>();
  const { activeIndex } = useSelector((state: RootState) => state.category);
  const { items } = useSelector((state: RootState) => state.cart);

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
      ); // Добавляем товар в корзину
    }
  };

  // Получаем данные товара
  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data } = await axios.get<Product>(
          `https://6794c225aad755a134ea56b6.mockapi.io/items/${parsedId}`
        );
        setProduct(data);
      } catch (error) {
        console.log("Ошибка загрузки товара", error);
      }
    }
    fetchProduct();
  }, [parsedId]);

  // // Если товар не найден, отображаем NotFoundPage
  // if (!product) {
  //   return <NotFoundPage />;
  // }

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
                  <p>
                    Цена: <span>{product?.price_rub} ₽</span>
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
