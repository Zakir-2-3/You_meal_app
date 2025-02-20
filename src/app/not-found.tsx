"use client";

import Image from "next/image";

import { useRouter } from "next/navigation";

import notFoundImg from "@/assets/images/not-found-img.png";

import "@/styles/NotFoundPage.scss";

export default function NotFoundPage() {
  const router = useRouter();

  const handleClick = () => {
    router.replace("/"); // Запрещаем возвращение на страницу 404
  };

  return (
    <div className="not-found-wrapper">
      <h1 className="not-found-wrapper__title">
        <b>4</b>{" "}
        <Image
          src={notFoundImg}
          className="not-found-wrapper__img"
          alt="not-found-img"
          width={150}
          height={150}
        />{" "}
        <b>4</b>
      </h1>
      <p className="not-found-wrapper__description">Страница не найдена</p>
      <button className="not-found-wrapper__btn" onClick={handleClick}>
        Вернуться назад
      </button>
    </div>
  );
}
