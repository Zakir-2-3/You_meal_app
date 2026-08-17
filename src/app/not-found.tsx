"use client";

import Image from "next/image";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { useTranslate } from "@/hooks/app/useTranslate";

import notFoundImg from "@/assets/images/not-found-img.png";

import "@/styles/NotFoundPage.scss";

export default function NotFoundPage() {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const router = useRouter();
  const { t } = useTranslate();

  const { goBack } = t.buttons;
  const { pageNotFound } = t.product;

  const handleClick = () => {
    if (isRedirecting) return;
    setIsRedirecting(true);
    // Запрещаем возвращение на страницу 404
    router.replace("/");
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
      <p className="not-found-wrapper__description">{pageNotFound}</p>
      <button
        className="not-found-wrapper__btn"
        onClick={handleClick}
        disabled={isRedirecting}
      >
        {goBack}
      </button>
    </div>
  );
}
