"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LottieIcon } from "@/components/ui/LottieIcon";

import { useTranslate } from "@/hooks/app/useTranslate";

import deliveryAnimation from "@/assets/animations/delivery_animation.json";

import "./DeliveryLink.scss";

type Props = {
  className?: string;
};

const DeliveryLink = ({ className }: Props) => {
  const [hovered, setHovered] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const pathname = usePathname();
  const { t } = useTranslate();

  const { freeShipping, freeShipping2 } = t.deliveryPage;

  // Сброс блокировки при смене пути
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  // Таймаут-подстраховка
  useEffect(() => {
    if (isNavigating) {
      const timer = setTimeout(() => setIsNavigating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isNavigating]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/delivery" || isNavigating) {
      e.preventDefault();
      return;
    }
    setIsNavigating(true);
  };

  return (
    <Link
      href="/delivery"
      className={`delivery-link ${className ?? ""} ${
        pathname === "/delivery" || isNavigating ? "is-disabled" : ""
      }`}
      title={freeShipping2}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        pointerEvents:
          pathname === "/delivery" || isNavigating ? "none" : "auto",
        opacity: pathname === "/delivery" || isNavigating ? 0.6 : 1,
      }}
    >
      <LottieIcon
        animationData={deliveryAnimation}
        trigger="hover+load"
        size={32}
        isHovered={hovered}
      />
      {freeShipping}
    </Link>
  );
};

export default DeliveryLink;
