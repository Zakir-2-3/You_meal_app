"use client";

import { useState, useEffect, useRef } from "react";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  activatePromo,
  deletePromo,
  removePromo,
} from "@/store/slices/promoSlice";

import PromoInput from "./PromoInput";
import ActivePromos from "./ActivePromos";
import PromoCodeListDropdown from "./PromoCodeListDropdown";

import { useTranslate } from "@/hooks/app/useTranslate";

import { DEFAULT_PROMOS } from "@/constants/user/defaults";
import {
  MAX_CUSTOM_PROMOS,
  MAX_ACTIVATED_PROMOS,
} from "@/constants/user/promoLimits";

import { PromoSectionProps } from "@/types/user/promo";

import "./PromoSection.scss";

const PromoSection = ({ translations }: PromoSectionProps) => {
  const [promoInput, setPromoInput] = useState("");
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [removingPromo, setRemovingPromo] = useState<string | null>(null);

  const promoListRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const { customAvailable, activated } = useSelector(
    (state: RootState) => state.promo,
  );

  const { t } = useTranslate();

  const maxActivatedReached = activated.length >= MAX_ACTIVATED_PROMOS;
  const canAddNewCustomPromo = customAvailable.length < MAX_CUSTOM_PROMOS;

  const availablePromoCodes = [
    ...DEFAULT_PROMOS.filter(
      (code) => !activated.some((c) => c.toUpperCase() === code.toUpperCase()),
    ),
    ...customAvailable.filter(
      (code) => !activated.some((c) => c.toUpperCase() === code.toUpperCase()),
    ),
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        promoListRef.current &&
        !promoListRef.current.contains(event.target as Node)
      ) {
        setPromoOpen(false);
      }
    };

    if (promoOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [promoOpen]);

  useEffect(() => {
    if (maxActivatedReached && promoInput) {
      setPromoInput("");
    }
  }, [maxActivatedReached, promoInput]);

  // Обработчик изменения инпута
  const handlePromoInputChange = (value: string) => {
    setPromoInput(value);
    setPromoError("");

    const trimmedValue = value.trim();
    const upperInput = trimmedValue.toUpperCase();

    // Проверка минимальной длины
    if (trimmedValue.length < 5 && trimmedValue.length > 0) {
      setPromoError(translations.promoCodeMin);
      return;
    }

    // Проверка дубликатов для валидной длины (5-13)
    if (trimmedValue.length >= 5 && trimmedValue.length <= 13) {
      const isDefault = DEFAULT_PROMOS.some(
        (code) => code.toUpperCase() === upperInput,
      );
      const alreadyInCustomList = customAvailable.some(
        (code) => code.toUpperCase() === upperInput,
      );
      const alreadyActivated = activated.some(
        (code) => code.toUpperCase() === upperInput,
      );

      if (alreadyActivated) {
        setPromoError(t.user.promoCodeHasAlreadyBeenActivated);
        return;
      }

      if (alreadyInCustomList || isDefault) {
        setPromoError(t.user.promoCodeAlreadyList);
        return;
      }
    }

    setPromoError("");
  };

  // Обработчик активации промокода из инпута
  const handleActivateFromInput = () => {
    const trimmedInput = promoInput.trim();
    const upperInput = trimmedInput.toUpperCase();

    if (!trimmedInput) return;
    if (trimmedInput.length < 5 || trimmedInput.length > 13) return;

    const isDefault = DEFAULT_PROMOS.some(
      (code) => code.toUpperCase() === upperInput,
    );
    const alreadyInCustomList = customAvailable.some(
      (code) => code.toUpperCase() === upperInput,
    );
    const alreadyActivated = activated.some(
      (code) => code.toUpperCase() === upperInput,
    );

    if (alreadyActivated || alreadyInCustomList || isDefault) {
      return;
    }

    if (!isDefault && !canAddNewCustomPromo) {
      setPromoError(
        t.user.maxCustomPromosMessage.replace(
          "{count}",
          MAX_CUSTOM_PROMOS.toString(),
        ),
      );
      return;
    }

    if (maxActivatedReached) {
      setPromoError(
        t.user.maxActivatedPromosMessage.replace(
          "{count}",
          MAX_ACTIVATED_PROMOS.toString(),
        ),
      );
      return;
    }

    dispatch(activatePromo(trimmedInput));
    setPromoInput("");
    setPromoError("");
  };

  // Обработчик активации промокода из списка
  const handleSelectPromo = (code: string) => {
    const upperCode = code.toUpperCase();

    if (activated.some((c) => c.toUpperCase() === upperCode)) {
      setPromoError(t.user.promoCodeHasAlreadyBeenActivated);
      return;
    }

    if (maxActivatedReached) {
      setPromoError(
        t.user.maxActivatedPromosMessage.replace(
          "{count}",
          MAX_ACTIVATED_PROMOS.toString(),
        ),
      );
      return;
    }

    dispatch(activatePromo(code));
    setPromoOpen(false);
    setPromoError("");
  };

  // Обработчик удаления промокода из списка доступных
  const handleDeletePromo = (code: string) => {
    if (activated.includes(code)) {
      dispatch(removePromo(code));
    } else {
      dispatch(deletePromo(code));
    }
    setPromoError("");
  };

  // Обработчик удаления активированного промокода с анимацией
  const handleRemovePromo = (code: string) => {
    setRemovingPromo(code);
    setTimeout(() => {
      dispatch(removePromo(code));
      setRemovingPromo(null);
    }, 300);
  };

  return (
    <div
      className="personal-account__promo"
      data-promo-count={activated.length}
    >
      <span className="promo-hint-3">Promocode3</span>

      <div className="personal-account__field">
        <label className="personal-account__label">
          {translations.promoCodeLabel}
        </label>

        <div className="personal-account__promo-wrapper">
          <PromoInput
            value={promoInput}
            onChange={handlePromoInputChange}
            error={promoError}
            disabled={maxActivatedReached}
            canAddNewCustomPromo={canAddNewCustomPromo}
            isDefaultPromo={DEFAULT_PROMOS.some(
              (code) => code.toUpperCase() === promoInput.trim().toUpperCase(),
            )}
            placeholder={translations.enterPromoCodePlaceholder}
            onActivate={handleActivateFromInput}
            activateText={translations.activateTr}
            maxLengthReached={promoInput.length === 13}
            maxLengthMessage={translations.promoCodeMax}
            maxActivatedReached={maxActivatedReached}
            maxActivatedMessage={translations.maxActivatedMessage}
          />

          <div ref={promoListRef}>
            <PromoCodeListDropdown
              isOpen={promoOpen}
              onClose={() => setPromoOpen(false)}
              availablePromoCodes={availablePromoCodes}
              maxPromosReached={maxActivatedReached}
              onSelectPromo={handleSelectPromo}
              onDeletePromo={handleDeletePromo}
              onToggle={() => {
                if (availablePromoCodes.length > 0) {
                  setPromoOpen((prev) => !prev);
                }
              }}
            />
          </div>
        </div>

        <ActivePromos
          activatedPromoCodes={activated}
          removingPromo={removingPromo}
          onRemovePromo={handleRemovePromo}
        />
      </div>
    </div>
  );
};

export default PromoSection;
