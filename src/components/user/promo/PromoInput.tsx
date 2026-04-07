"use client";

import { useTranslate } from "@/hooks/app/useTranslate";

import { PromoInputProps } from "@/types/user/promo";

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
    onChange(e.target.value);
  };

  const handleActivateClick = () => {
    onActivate();
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

      {message && <p className="personal-account__promo-error">{message}</p>}

      <button
        onClick={handleActivateClick}
        className="personal-account__button personal-account__button--primary"
        disabled={isActivateDisabled}
      >
        {activateText}
      </button>
    </>
  );
};

export default PromoInput;
