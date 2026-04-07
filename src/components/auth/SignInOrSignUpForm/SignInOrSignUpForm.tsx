import { useTranslate } from "@/hooks/app/useTranslate";

import { createValidationRules } from "@/utils/auth/validationRules";

import TogglePasswordButton from "@/UI/inputs/TogglePasswordButton";

import { Props } from "@/types/components/auth/sign-in-or-sign-up-form";

export default function SignInOrSignUpForm({
  isSignUpMode,
  passwordError,
  errors,
  register,
  showPassword,
  togglePassword,
  onSubmit,
  onForgotPassword,
  onSwitchMode,
}: Props) {
  const { t, lang } = useTranslate();

  const { registerTr, forgotPassword, signInAccountTr, orTr } = t.regForm;

  const {
    nameLabel,
    emailLabel,
    passwordLabel,
    namePlaceholder,
    emailPlaceholder,
    passwordPlaceholder,
  } = t.user;

  const validationRules = createValidationRules(t.formErrors);

  return (
    <form
      className={
        isSignUpMode
          ? "registration-form__sign-up"
          : "registration-form__sign-in"
      }
      onSubmit={onSubmit}
    >
      {isSignUpMode && (
        <div className="registration-form__field">
          <label className="registration-form__label" htmlFor="name">
            {nameLabel}
          </label>
          <input
            id="name"
            type="text"
            {...register("name", validationRules.nameValidation)}
            className="registration-form__input"
            placeholder={namePlaceholder}
          />
          {typeof errors.name?.message === "string" && (
            <p
              className={`registration-form__input--error ${
                lang === "en" ? "english-style" : ""
              }`}
            >
              {errors.name.message}
            </p>
          )}
        </div>
      )}

      <div className="registration-form__field">
        <label className="registration-form__label" htmlFor="email">
          {emailLabel}
        </label>
        <input
          id="email"
          type="email"
          {...register("email", validationRules.emailValidation)}
          className="registration-form__input"
          placeholder={emailPlaceholder}
        />
        {typeof errors.email?.message === "string" && (
          <p
            className={`registration-form__input--error ${
              lang === "en" ? "english-style" : ""
            }`}
          >
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="registration-form__field">
        <label className="registration-form__label" htmlFor="password">
          {passwordLabel}
        </label>
        <div className="registration-form__password-container">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password", validationRules.passwordValidation)}
            className="registration-form__input"
            placeholder={passwordPlaceholder}
          />
          <TogglePasswordButton
            visible={showPassword}
            onToggle={togglePassword}
          />
        </div>
        {typeof errors.password?.message === "string" && (
          <p
            className={`registration-form__input--error ${
              lang === "en" ? "english-style" : ""
            }`}
          >
            {errors.password.message}
          </p>
        )}
      </div>

      {passwordError && (
        <p className="registration-form__input--error-password">
          {passwordError}
        </p>
      )}

      <div className="registration-form__actions">
        <button
          type="button"
          onClick={onForgotPassword}
          className="registration-form__button--secondary registration-form__forgot-button"
        >
          {forgotPassword}
        </button>

        <button
          type="button"
          onClick={onSwitchMode}
          className="registration-form__button--secondary"
        >
          {isSignUpMode ? signInAccountTr : registerTr}
        </button>
      </div>

      <button
        type="submit"
        className="registration-form__button registration-form__button--primary"
      >
        {isSignUpMode ? registerTr : signInAccountTr}
      </button>

      <div className="registration-form__divider">
        <div className="registration-form__line" />
        <div className="registration-form__or">{orTr}</div>
        <div className="registration-form__line" />
      </div>
    </form>
  );
}
