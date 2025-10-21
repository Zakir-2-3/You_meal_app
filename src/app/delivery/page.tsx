"use client";

import Image from "next/image";

import NavButtons from "@/components/NavButtons/NavButtons";

import { useTranslate } from "@/hooks/useTranslate";

import deliveryPageImg from "@/assets/images/delivery-page-img.png";

import "./deliveryPage.scss";

export default function DeliveryPage() {
  const { t } = useTranslate();

  const { howToOrder, workingHours, costAndTime, title, titleNav } =
    t.deliveryPage;

  return (
    <section className="delivery-page-section">
      <div className="container">
        <h1 className="delivery-page-section__title">{title}</h1>
        <NavButtons customTitle={titleNav} />
        <div className="delivery-page-section__img">
          <Image
            src={deliveryPageImg}
            priority
            alt="delivery-page-img"
            width={500}
            height={560}
          />
        </div>
        <div className="delivery-page-section__info">
          <h2>{howToOrder.title}</h2>
          <ul>
            {howToOrder.list.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h2>{workingHours.title}</h2>
          {workingHours.paragraphs.map((p, index) => (
            <p key={index}>{p}</p>
          ))}

          <h2>{costAndTime.title}</h2>
          <ul>
            {costAndTime.list.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
