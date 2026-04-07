import React from "react";
import Image from "next/image";

import { CloseButtonProps } from "@/types/components/common/close-button";

import closeButtonIcon from "@/assets/icons/close-button.svg";

import "./CloseButton.scss";

const CloseButton: React.FC<CloseButtonProps> = ({
  onClick,
  onMouseEnter,
  onMouseLeave,
  className = "",
  ariaLabel = "",
  title = "",
  height = 20,
  width = 20,
  children,
}) => {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`close-button ${className}`}
      aria-label={ariaLabel}
      title={title}
      style={{ width, height }}
    >
      {children || (
        <Image
          src={closeButtonIcon}
          width={width}
          height={height}
          alt="close-icon"
        />
      )}
    </button>
  );
};

export default CloseButton;
