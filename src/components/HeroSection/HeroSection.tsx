import Image from "next/image";

import "./HeroSection.scss";

import heroSectionImg_1 from "@/assets/images/hero-section-img-1.png";

const HeroSection = () => {
  return (
    <section className="hero-section">
        <div className="hero-section__content">
          <Image
            src={heroSectionImg_1}
            className="hero-section__img"
            alt="hero-section-img"
          />
          <div className="hero-section__text">
            <h1 className="hero-section__title">
              Только самые <br />
              <b>сочные бургеры!</b>
            </h1>
            <p className="hero-section__delivery">
              Бесплатная доставка от 599₽*
            </p>
          </div>
        </div>
        <div></div>
    </section>
  );
};

export default HeroSection;
