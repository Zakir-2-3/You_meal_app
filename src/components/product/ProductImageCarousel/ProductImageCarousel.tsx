"use client";

import { useCallback, useEffect, useState } from "react";

import Image from "next/image";

import useEmblaCarousel from "embla-carousel-react";

import { ProductImageCarouselProps } from "@/types/components/common/product-image-carousel";

import arrowIcon from "@/assets/icons/arrow-icon.svg?url";

import "./ProductImageCarousel.scss";

const ProductImageCarousel = ({
  images,
  alt,
  showControls = false,
}: ProductImageCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="carousel">
      <div className="carousel__viewport" ref={emblaRef}>
        <div className="carousel__container">
          {images.map((src, index) => (
            <div className="carousel__slide" key={index}>
              <Image
                src={src}
                alt={`${alt} ${index + 1}`}
                width={170}
                height={170}
                className="carousel__image"
                priority={index === 0} // первое изображение загружается сразу
              />
            </div>
          ))}
        </div>
      </div>

      <button
        className={`carousel__button carousel__button--prev ${
          showControls ? "carousel__button--visible" : ""
        }`}
        onClick={scrollPrev}
      >
        <img src={arrowIcon} width={16} height={16} alt="arrow-icon" />
      </button>
      <button
        className={`carousel__button carousel__button--next ${
          showControls ? "carousel__button--visible" : ""
        }`}
        onClick={scrollNext}
      >
        <img src={arrowIcon} width={16} height={16} alt="arrow-icon" />
      </button>

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
