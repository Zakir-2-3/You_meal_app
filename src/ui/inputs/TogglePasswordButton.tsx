"use client";

import { FC } from "react";

import Image from "next/image";

import hidePasswordIcon from "@/assets/icons/hide-password-icon.svg";
import showPasswordIcon from "@/assets/icons/show-password-icon.svg";

type Props = {
  visible: boolean;
  onToggle: () => void;
};

const TogglePasswordButton: FC<Props> = ({ visible, onToggle }) => {
  return (
    <button
      type="button"
      className="registration-form__toggle-password"
      onClick={onToggle}
    >
      <Image
        src={visible ? showPasswordIcon : hidePasswordIcon}
        width={20}
        height={20}
        alt="toggle-password-icon"
      />
    </button>
  );
};

export default TogglePasswordButton;
