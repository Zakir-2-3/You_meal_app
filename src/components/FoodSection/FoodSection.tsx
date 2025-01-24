import Image from "next/image";

import "./FoodSection.scss";

import dd from '@/assets/images/hero-section-img-1.png'

const FoodSection = () => {
  return (
    <section className="food-section">
      <h2 className="food-section__title">Бургеры</h2>
      <div className="food-section__wrapper">
        <div className="food-section__card">
          <div className="food-section__card-img">
            <Image src={dd} alt="dd" />
          </div>
          <div className="food-section__card-description">
            <h3>689P</h3>
            <p>Мясная бомба</p>
            <p>520г</p>
          </div>
          <div className="food-section__card-add-btn">
            <button>Добавить</button>
          </div>
        </div>
      </div>
      <button className="food-section__load-more">Загрузить еще</button>
    </section>
  );
};

export default FoodSection;
