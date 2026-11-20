"use client";

import { useEffect, useRef, useState } from "react";

import fitText from "@activetheory/fit-text";

import { useTranslate } from "@/hooks/app/useTranslate";

import CloseButton from "@/UI/buttons/CloseButton/CloseButton";

import { DEFAULT_PROMOS } from "@/constants/user/defaults";

import { ActivePromosProps } from "@/types/user/promo";

const ActivePromos = ({
  activatedPromoCodes,
  removingPromo,
  onRemovePromo,
}: ActivePromosProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const { t } = useTranslate();

  const containerRefs = useRef<Array<HTMLDivElement | null>>([]);
  const promoTagRefs = useRef<Array<HTMLDivElement | null>>([]);
  const textRefs = useRef<Array<HTMLParagraphElement | null>>([]);

  const isTouchDevice = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  // Логика для ПК (mousemove) — оставляем как было
  useEffect(() => {
    if (isTouchDevice()) return; // на тач не вешаем

    // Функция для обработки движения мыши
    const handleMouseMove = (e: MouseEvent, index: number) => {
      const container = containerRefs.current[index];
      const promoTag = promoTagRefs.current[index];
      if (!container || !promoTag) return;

      // Получаем позицию курсора относительно контейнера
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      // Определяем границы: Правые 25% контейнера
      const rightAreaStart = rect.width * 0.75;

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
      const mm = (e: MouseEvent) => handleMouseMove(e, index);
      const ml = () => handleMouseLeave(index);
      container.addEventListener("mousemove", mm);
      container.addEventListener("mouseleave", ml);

      return () => {
        container.removeEventListener("mousemove", mm);
        container.removeEventListener("mouseleave", ml);
      };
    });

    // Очистка при размонтировании
    return () => {
      cleanupFunctions.forEach((c) => c && c());
    };
  }, [activatedPromoCodes.length]);

  // Клик вне - закрывает раскрытый блок
  useEffect(() => {
    if (!isTouchDevice()) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (expandedIndex === null) return;
      const container = containerRefs.current[expandedIndex];
      if (container && !container.contains(e.target as Node)) {
        setExpandedIndex(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [expandedIndex]);

  // Подгоняем размер шрифта под ширину блока для каждого промокода
  useEffect(() => {
    const timer = setTimeout(() => {
      activatedPromoCodes.forEach((_, index) => {
        const el = textRefs.current[index];
        const box = containerRefs.current[index];

        if (el && box) {
          fitText({
            el,
            box,
            singleLine: true,
            minFontSize: 8,
            maxFontSize: 17,
            boxMultiplier: [0.95, 1],
          });
        }
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [activatedPromoCodes]);

  if (activatedPromoCodes.length === 0) return null;

  return (
    <div className="personal-account__promo-active">
      {activatedPromoCodes.map((code, index) => {
        const isDefault = DEFAULT_PROMOS.includes(code);
        const title = isDefault
          ? (t.user as any)[code] || t.user.newPromoCodeTitle
          : t.user.newPromoCodeTitle;
        const isExpanded = expandedIndex === index;

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
            } ${isExpanded ? "personal-account__promo-container--expanded" : ""}`}
            onClick={(e) => {
              if (!isTouchDevice()) return;
              if (
                (e.target as HTMLElement).closest(
                  ".personal-account__promo-remove",
                )
              )
                return;
              setExpandedIndex(isExpanded ? null : index);
            }}
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
              <p
                ref={(el) => {
                  textRefs.current[index] = el;
                }}
              >
                {code}
              </p>
            </div>
            <CloseButton
              className="personal-account__promo-remove"
              onClick={() => {
                setExpandedIndex(null);
                onRemovePromo(code);
              }}
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
