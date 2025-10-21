import React, { FC } from "react";

import Image from "next/image";

import { useTranslate } from "@/hooks/useTranslate";

import heroSectionImg_1 from "@/assets/images/hero-section-img-1.png";

import "./HeroSection.scss";

const HeroSection: FC = React.memo(() => {
  const { t } = useTranslate();

  const { title, title2 } = t.header;

  return (
    <section className="hero-section">
      <div className="hero-section__content">
        <Image
          src={heroSectionImg_1}
          className="hero-section__img"
          alt="hero-section-img"
          width={255}
          height={291}
          priority
        />
        <div className="hero-section__text">
          <h1 className="hero-section__title">
            {title}
            <br />
            <b>{title2}</b>
          </h1>
        </div>
      </div>
      <div></div>
    </section>
  );
});

export default HeroSection;
