"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

import Image from "next/image";

import useEmblaCarousel from "embla-carousel-react";

import { ProductImageGalleryProps } from "@/types/components/common/product-image-gallery";

import arrowIcon from "@/assets/icons/arrow-icon.svg?url";

import "./ProductImageGallery.scss";

type Props = ProductImageGalleryProps & { children?: ReactNode };

const ProductImageGallery = ({ images, alt, children }: Props) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    align: "end",
    containScroll: "keepSnaps",
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
      emblaThumbsApi?.scrollTo(index);
    },
    [emblaApi, emblaThumbsApi],
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // Синхронизация основного изображения с блоками
  useEffect(() => {
    if (!emblaApi || !emblaThumbsApi) return;

    const onSelect = () => {
      const index = emblaApi.selectedScrollSnap();
      setSelectedIndex(index);

      const inView = emblaThumbsApi.slidesInView();
      if (inView.length === 0) return;

      const firstVisible = inView[0];
      const lastVisible = inView[inView.length - 1];

      // Двигаем миниатюры только если активная вышла за пределы видимых
      if (index > lastVisible || index < firstVisible) {
        emblaThumbsApi.scrollTo(index);
      }
    };

    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, emblaThumbsApi]);

  // Клик по миниатюре — скроллим основное изображение
  useEffect(() => {
    if (!emblaThumbsApi || !emblaApi) return;

    const onThumbClick = () => {
      emblaApi.scrollTo(emblaThumbsApi.selectedScrollSnap());
    };

    emblaThumbsApi.on("select", onThumbClick);
    return () => {
      emblaThumbsApi.off("select", onThumbClick);
    };
  }, [emblaThumbsApi, emblaApi]);

  return (
    <div className="product-gallery">
      {children}

      <div className="product-gallery__viewport" ref={emblaRef}>
        <div className="product-gallery__container">
          {images.map((src, index) => (
            <div className="product-gallery__slide" key={index}>
              <Image
                src={src}
                alt={`${alt} ${index + 1}`}
                width={480}
                height={480}
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </div>

      <button className="product-gallery__prev" onClick={scrollPrev}>
        <img src={arrowIcon} width={18} height={18} alt="arrow-icon" />
      </button>
      <button className="product-gallery__next" onClick={scrollNext}>
        <img src={arrowIcon} width={18} height={18} alt="arrow-icon" />
      </button>

      <div className="product-gallery__thumbs" ref={emblaThumbsRef}>
        <div className="product-gallery__thumbs-container">
          {images.map((src, index) => (
            <button
              key={index}
              className={`product-gallery__thumb ${
                index === selectedIndex ? "is-selected" : ""
              }`}
              onClick={() => scrollTo(index)}
            >
              <Image
                src={src}
                alt={`${alt} thumbnail`}
                width={65}
                height={65}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductImageGallery;
