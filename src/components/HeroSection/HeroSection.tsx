import Image from "next/image";
import Link from "next/link";

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
          <Link href="/delivery" className="hero-section__delivery cart-sidebar__delivery-link">
            Бесплатная доставка от 599₽*
          </Link>
        </div>
      </div>
      <div></div>
    </section>
  );
};

export default HeroSection;
