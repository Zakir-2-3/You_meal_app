"use client";

import { FC } from "react";

import { Props } from "@/types/components/ui/toggle-password-button";

import hidePasswordIcon from "@/assets/icons/hide-password-icon.svg?url";
import showPasswordIcon from "@/assets/icons/show-password-icon.svg?url";

const TogglePasswordButton: FC<Props> = ({ visible, onToggle }) => {
  return (
    <button
      type="button"
      className="registration-form__toggle-password"
      onClick={onToggle}
    >
      <img
        src={visible ? showPasswordIcon : hidePasswordIcon}
        width={20}
        height={20}
        alt="toggle-password-icon"
      />
    </button>
  );
};

export default TogglePasswordButton;
