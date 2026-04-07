"use client";

import { useEffect, useRef } from "react";

import CloseButton from "@/UI/buttons/CloseButton/CloseButton";

import { useTranslate } from "@/hooks/app/useTranslate";

import { DEFAULT_PROMOS } from "@/constants/user/defaults";

import { ActivePromosProps } from "@/types/user/promo";

const ActivePromos = ({
  activatedPromoCodes,
  removingPromo,
  onRemovePromo,
}: ActivePromosProps) => {
  const { t } = useTranslate();
  const containerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const promoTagRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    // Функция для обработки движения мыши
    const handleMouseMove = (e: MouseEvent, index: number) => {
      const container = containerRefs.current[index];
      const promoTag = promoTagRefs.current[index];

      if (!container || !promoTag) return;

      // Получаем позицию курсора относительно контейнера
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const containerWidth = rect.width;

      // Определяем границы:
      // - Правые 25% контейнера
      const rightAreaStart = containerWidth * 0.75;

      // Снимаем предыдущие классы
      promoTag.classList.remove("move-left-partial", "move-left-full");

      if (mouseX >= rightAreaStart) {
        // Курсор в правых 25% - полное смещение
        promoTag.classList.add("move-left-full");
      } else {
        // Курсор в левых 75% - частичное смещение
        promoTag.classList.add("move-left-partial");
      }
    };

    // Функция для обработки ухода мыши
    const handleMouseLeave = (index: number) => {
      const promoTag = promoTagRefs.current[index];
      if (promoTag) {
        promoTag.classList.remove("move-left-partial", "move-left-full");
      }
    };

    const cleanupFunctions = containerRefs.current.map((container, index) => {
      if (!container) return () => {};

      const mouseMoveHandler = (e: MouseEvent) => handleMouseMove(e, index);
      const mouseLeaveHandler = () => handleMouseLeave(index);

      container.addEventListener("mousemove", mouseMoveHandler);
      container.addEventListener("mouseleave", mouseLeaveHandler);

      return () => {
        container.removeEventListener("mousemove", mouseMoveHandler);
        container.removeEventListener("mouseleave", mouseLeaveHandler);
      };
    });

    // Очистка при размонтировании
    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup && cleanup());
    };
  }, [activatedPromoCodes.length]);

  const getFontSize = (code: string) => {
    const length = code.length;
    if (length >= 13) return 9;
    if (length === 12) return 11;
    if (length === 11) return 12;
    if (length === 10) return 14;
    if (length === 9) return 15;
    return 15;
  };

  if (activatedPromoCodes.length === 0) return null;

  return (
    <div className="personal-account__promo-active">
      {activatedPromoCodes.map((code, index) => {
        const isDefault = DEFAULT_PROMOS.includes(code);
        const title = isDefault
          ? (t.user as any)[code] || t.user.newPromoCodeTitle
          : t.user.newPromoCodeTitle;

        return (
          <div
            key={code}
            ref={(el) => {
              containerRefs.current[index] = el;
            }}
            className={`personal-account__promo-container ${
              removingPromo === code
                ? "personal-account__promo-container--removing"
                : ""
            }`}
          >
            <div
              ref={(el) => {
                promoTagRefs.current[index] = el;
              }}
              title={title}
              className={`personal-account__promo-tag ${
                isDefault
                  ? "personal-account__promo-tag--default"
                  : "personal-account__promo-item--custom"
              }`}
            >
              <p style={{ fontSize: getFontSize(code) }}>{code}</p>
            </div>
            <CloseButton
              className="personal-account__promo-remove"
              onClick={() => onRemovePromo(code)}
              width={11}
              height={11}
              ariaLabel={t.buttons.disablePromoCodeAriaLabel}
              title={t.buttons.removePromoCodeFromListActivePromo}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ActivePromos;
