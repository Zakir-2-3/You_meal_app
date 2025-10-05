import React from "react";

import Image from "next/image";

import registrationFormCloseBtnIcon from "@/assets/icons/registration-form-close-btn-icon.svg";

interface CloseButtonProps {
  onClick: () => void;
  className?: string;
  ariaLabel?: string;
}

const CloseButton: React.FC<CloseButtonProps> = ({
  onClick,
  className = "",
  ariaLabel = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={`registration-form__close-btn ${className}`}
      aria-label={ariaLabel}
    >
      <Image
        src={registrationFormCloseBtnIcon}
        alt="close"
        width={20}
        height={20}
      />
    </button>
  );
};

export default CloseButton;
