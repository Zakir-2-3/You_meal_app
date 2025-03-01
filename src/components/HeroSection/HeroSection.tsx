import React, { FC } from "react";

import Image from "next/image";
import Link from "next/link";

import heroSectionImg_1 from "@/assets/images/hero-section-img-1.png";

import "./HeroSection.scss";

// Оптимизируем hero-section, чтобы не рендерилась много раз
const HeroSection: FC = React.memo(() => {
  return (
    <section className="hero-section">
      <div className="hero-section__content">
        <Image
          src={heroSectionImg_1}
          className="hero-section__img"
          alt="hero-section-img"
          width={255}
          height={291}
        />
        <div className="hero-section__text">
          <h1 className="hero-section__title">
            Только самые <br />
            <b>сочные бургеры!</b>
          </h1>
          <Link
            href="/delivery"
            className="hero-section__delivery cart-sidebar__delivery-link"
          >
            Бесплатная доставка от 599₽*
          </Link>
        </div>
      </div>
      <div></div>
    </section>
  );
});

export default HeroSection;
