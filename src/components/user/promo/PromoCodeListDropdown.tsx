"use client";

import { useState } from "react";

import { LottieIcon } from "@/components/ui/LottieIcon";

import { useTranslate } from "@/hooks/app/useTranslate";

import CloseButton from "@/UI/buttons/CloseButton/CloseButton";

import { DEFAULT_PROMOS } from "@/constants/user/defaults";

import { PromoCodeListDropdownProps } from "@/types/user/promo";

import saleAnimation from "@/assets/animations/sale_animation.json";

const PromoCodeListDropdown = ({
  isOpen,
  onClose,
  availablePromoCodes,
  maxPromosReached,
  onSelectPromo,
  onDeletePromo,
  onToggle,
}: PromoCodeListDropdownProps) => {
  const [removingCode, setRemovingCode] = useState<string | null>(null);

  const { t } = useTranslate();

  const handleRemove = (code: string) => setRemovingCode(code);

  const onTransitionEnd = (code: string) => {
    // После завершения анимации удаляем код из списка
    onDeletePromo(code);
    setRemovingCode(null);
  };

  return (
    <div className="personal-account__promo-select">
      <button
        type="button"
        className="personal-account__promo-toggle"
        onClick={onToggle}
        disabled={availablePromoCodes.length === 0}
        aria-disabled={availablePromoCodes.length === 0}
      >
        <LottieIcon
          animationData={saleAnimation}
          trigger="always"
          loop
          size={34}
          enabled={availablePromoCodes.length > 0}
        />
      </button>

      <ul
        className={`personal-account__promo-list ${
          isOpen ? "personal-account__promo-list--visible" : ""
        }`}
        style={{
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? "visible" : "hidden",
        }}
      >
        {availablePromoCodes.map((code: string) => {
          const isDefault = DEFAULT_PROMOS.includes(code);
          const isRemoving = removingCode === code;

          const title = isDefault
            ? (t.user as any)[code] || t.user.newPromoCodeTitle
            : t.user.newPromoCodeTitle;

          return (
            <li
              key={code}
              title={title}
              className={`personal-account__promo-item${
                isDefault
                  ? " personal-account__promo-item--default"
                  : " personal-account__promo-item--custom"
              }${maxPromosReached ? " disabled" : ""}${
                isRemoving ? " removing" : ""
              }`}
              onClick={() => {
                if (!maxPromosReached) {
                  onSelectPromo(code);
                  onClose();
                }
              }}
              onTransitionEnd={() => {
                if (isRemoving) onTransitionEnd(code);
              }}
            >
              <p>{code}</p>
              {!isDefault && (
                <CloseButton
                  className="personal-account__promo-remove"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    handleRemove(code);
                  }}
                  width={14}
                  height={14}
                  ariaLabel={t.buttons.removePromoCodeFromListAriaLabel}
                  title={t.buttons.removePromoCodeFromListAriaLabel}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PromoCodeListDropdown;
