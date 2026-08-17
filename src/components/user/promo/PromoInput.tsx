"use client";

import { useTranslate } from "@/hooks/app/useTranslate";

import CloseButton from "@/UI/buttons/CloseButton/CloseButton";

import { PromoInputProps } from "@/types/user/promo";

import searchCloseIcon from "@/assets/icons/search-close-icon.svg?url";

const PromoInput = ({
  value,
  onChange,
  error,
  disabled,
  placeholder,
  onActivate,
  activateText,
  canAddNewCustomPromo = true,
  isDefaultPromo = false,
  maxLengthReached,
  maxLengthMessage,
  maxActivatedReached,
  maxActivatedMessage,
}: PromoInputProps) => {
  const { t } = useTranslate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let filtered = e.target.value.replace(/[^a-zA-Zа-яА-ЯёЁ0-9\s\-.]/g, "");

    if (/^[\s.-]+$/.test(filtered)) {
      filtered = "";
    } else if (filtered.length > 0) {
      const firstChar = filtered.charAt(0);
      if (/[a-zA-Zа-яА-ЯёЁ]/.test(firstChar)) {
        filtered = firstChar.toUpperCase() + filtered.slice(1);
      }
    }

    onChange(filtered);
  };

  const handleClear = () => {
    onChange("");
  };

  const trimmedValue = value.trim();

  const isActivateDisabled =
    disabled ||
    !trimmedValue ||
    trimmedValue.length < 5 ||
    trimmedValue.length > 13 ||
    (!isDefaultPromo && !canAddNewCustomPromo) ||
    !!error;

  let message = "";

  if (error) {
    message = error;
  } else if (maxActivatedReached) {
    // Достигнут лимит активных промокодов
    message = maxActivatedMessage || t.user.maxActivatedMessage;
  } else if (maxLengthReached && trimmedValue.length >= 5) {
    // Достигнут лимит символов
    message = maxLengthMessage || t.user.promoCodeMax;
  } else if (!isDefaultPromo && !canAddNewCustomPromo && trimmedValue) {
    // Лимит ручных промокодов
    message = t.user.listPromoCodesFull;
  }

  return (
    <>
      <input
        type="text"
        placeholder={placeholder}
        className="personal-account__input"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        maxLength={13}
      />
      {trimmedValue.length > 0 && (
        <CloseButton
          onClick={handleClear}
          className="personal-account__promo-clear-btn"
          ariaLabel={t.buttons.clearPromoInputAriaLabel || "clear"}
          width={20}
          height={20}
        >
          <img src={searchCloseIcon} alt="clear" width={14} height={14} />
        </CloseButton>
      )}

      {message && <p className="personal-account__promo-error">{message}</p>}

      <button
        onClick={onActivate}
        className="personal-account__button personal-account__button--primary"
        disabled={isActivateDisabled}
      >
        {activateText}
      </button>
    </>
  );
};

export default PromoInput;
