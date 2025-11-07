"use client";

import Image from "next/image";

import useEmblaCarousel from "embla-carousel-react";

import { useCallback, useEffect, useState } from "react";

import arrowIcon from "@/assets/icons/arrow-icon.svg";

import "./ProductImageGallery.scss";

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
}

const ProductImageGallery = ({ images, alt }: ProductImageGalleryProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  return (
    <div className="product-gallery">
      <div className="product-gallery__viewport" ref={emblaRef}>
        <div className="product-gallery__container">
          {images.map((src, index) => (
            <div className="product-gallery__slide" key={index}>
              <Image
                src={src}
                alt={`${alt} ${index + 1}`}
                width={500}
                height={500}
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Стрелки */}
      <button className="product-gallery__prev" onClick={scrollPrev}>
        <Image src={arrowIcon} width={18} height={18} alt="arrow-icon" />
      </button>
      <button className="product-gallery__next" onClick={scrollNext}>
        <Image src={arrowIcon} width={18} height={18} alt="arrow-icon" />
      </button>

      {/* Превьюшки */}
      <div className="product-gallery__thumbs">
        {images.map((src, index) => (
          <button
            key={index}
            className={`product-gallery__thumb ${
              index === selectedIndex ? "is-selected" : ""
            }`}
            onClick={() => scrollTo(index)}
          >
            <Image src={src} alt={`${alt} thumbnail`} width={65} height={65} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductImageGallery;
