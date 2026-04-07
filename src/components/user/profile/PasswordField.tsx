"use client";

import Image from "next/image";

import { PasswordFieldProps } from "@/types/components/ui/password-field";

import HidePasswordIcon from "@/assets/icons/hide-password-icon.svg";
import ShowPasswordIcon from "@/assets/icons/show-password-icon.svg";

const PasswordField = ({
  editMode,
  isGoogleUser,
  showPassword,
  register,
  errors,
  validationRules,
  watch,
  passwordSameError,
  onToggleShowPassword,
  translations,
}: PasswordFieldProps) => {
  if (editMode) {
    if (!isGoogleUser) {
      return (
        <div className="personal-account__field">
          <label
            className="personal-account__label"
            htmlFor="user-new-password"
          >
            {translations.passwordLabel}
          </label>
          <div className="personal-account__input-password-wrapper">
            <input
              id="user-new-password"
              type={showPassword ? "text" : "password"}
              placeholder={translations.newPasswordUserLabel}
              className="personal-account__input personal-account__input--edit"
              {...register(
                "newPassword",
                validationRules.optionalPasswordEditValidation,
              )}
            />
            <button
              type="button"
              className="personal-account__value-toggle"
              onClick={onToggleShowPassword}
            >
              {showPassword ? (
                <Image
                  src={ShowPasswordIcon}
                  width={20}
                  height={20}
                  alt="show-password-icon"
                />
              ) : (
                <Image
                  src={HidePasswordIcon}
                  width={20}
                  height={20}
                  alt="hide-password-icon"
                />
              )}
            </button>

            <input
              id="user-repeat-password"
              type={showPassword ? "text" : "password"}
              placeholder={translations.repeatPasswordPlaceholder}
              className="personal-account__input personal-account__input--edit"
              {...register(
                "repeatPassword",
                validationRules.repeatPasswordEditValidation(() =>
                  watch("newPassword"),
                ),
              )}
            />
          </div>

          {errors.newPassword && (
            <p className="registration-form__input--error personal-account__password-error">
              {errors.newPassword.message}
            </p>
          )}
          {passwordSameError && (
            <p className="registration-form__input--error personal-account__password-error">
              {passwordSameError}
            </p>
          )}
          {errors.repeatPassword && (
            <p className="registration-form__input--error personal-account__repeat-password-error">
              {errors.repeatPassword.message}
            </p>
          )}
        </div>
      );
    } else {
      // Google пользователь в режиме редактирования
      return (
        <div className="personal-account__field">
          <label className="personal-account__label" htmlFor="user-password">
            {translations.passwordLabel}
          </label>
          <input
            id="user-password"
            type="password"
            className="personal-account__input personal-account__input--edit"
            value="••••••••"
            disabled
            readOnly
          />
          {isGoogleUser && (
            <p className="personal-account__hint">
              {translations.passwordUnavailableHint}
            </p>
          )}
        </div>
      );
    }
  } else {
    // Не в режиме редактирования
    return (
      <div className="personal-account__field">
        <label className="personal-account__label">
          {translations.passwordLabel}
        </label>
        <div className="personal-account__value-container">
          <span className="personal-account__value">••••••••</span>
        </div>
      </div>
    );
  }
};

export default PasswordField;
