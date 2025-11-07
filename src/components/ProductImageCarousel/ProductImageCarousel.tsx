"use client";

import { useCallback, useEffect, useState } from "react";

import Image from "next/image";

import useEmblaCarousel from "embla-carousel-react";

import arrowIcon from "@/assets/icons/arrow-icon.svg";

import "./ProductImageCarousel.scss";

interface ProductImageCarouselProps {
  images: string[];
  alt: string;
  showControls?: boolean;
}

const ProductImageCarousel = ({
  images,
  alt,
  showControls = false,
}: ProductImageCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const [selectedIndex, setSelectedIndex] = useState(0);

  // Отслеживаем изменение слайда
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );

  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  return (
    <div className="carousel">
      {/* Основная обёртка */}
      <div className="carousel__viewport" ref={emblaRef}>
        <div className="carousel__container">
          {images.map((src, index) => (
            <div className="carousel__slide" key={index}>
              <Image
                src={src}
                alt={`${alt} ${index + 1}`}
                width={180}
                height={180}
                className="carousel__image"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Стрелки */}
      <button
        className={`carousel__button carousel__button--prev ${
          showControls ? "carousel__button--visible" : ""
        }`}
        onClick={scrollPrev}
      >
        <Image src={arrowIcon} width={16} height={16} alt="arrow-icon" />
      </button>
      <button
        className={`carousel__button carousel__button--next ${
          showControls ? "carousel__button--visible" : ""
        }`}
        onClick={scrollNext}
      >
        <Image src={arrowIcon} width={16} height={16} alt="arrow-icon" />
      </button>

      {/* Индикаторы */}
      <div
        className={`carousel__dots ${
          showControls ? "carousel__dots--visible" : ""
        }`}
      >
        {images.map((_, index) => (
          <button
            key={index}
            className={`carousel__dot ${
              index === selectedIndex ? "carousel__dot--active" : ""
            }`}
            onClick={() => emblaApi?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductImageCarousel;
