"use client";

import Image from "next/image";

import registrationFormCloseBtnIcon from "@/assets/icons/registration-form-close-btn-icon.svg";

type Props = {
  width?: number;
  height?: number;
  className?: string;
};

const CloseIcon = ({ width = 14, height = 16, className = "" }: Props) => (
  <Image
    src={registrationFormCloseBtnIcon}
    width={width}
    height={height}
    alt="close-btn"
    className={className}
  />
);

export default CloseIcon;
