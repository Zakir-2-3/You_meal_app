import { FieldErrors, UseFormRegister } from "react-hook-form";

import { createValidationRules } from "@/utils/validationRules";

import { useTranslate } from "@/hooks/useTranslate";

import { RegForm } from "@/types/regForm";

import TogglePasswordButton from "@/ui/inputs/TogglePasswordButton";

type Props = {
  signupOn: boolean;
  setSignupOn: (value: boolean) => void;
  setStep: (step: "form" | "verify" | "set-new-password") => void;
  setForgotMode: (value: boolean) => void;
  setForgotModeOrigin: (origin: "signup" | "login") => void;
  resetForm: () => void;
  passwordError: string;
  setPasswordError: (msg: string) => void;
  errors: FieldErrors<RegForm>;
  register: UseFormRegister<RegForm>;
  showPassword: boolean;
  togglePassword: () => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => void;
  onForgotPassword: () => void;
  onSwitchMode: () => void;
};

export default function LoginOrSignupForm({
  signupOn,
  setSignupOn,
  setStep,
  setForgotMode,
  setForgotModeOrigin,
  resetForm,
  passwordError,
  setPasswordError,
  errors,
  register,
  showPassword,
  togglePassword,
  onSubmit,
  onForgotPassword,
  onSwitchMode,
}: Props) {
  const { t, lang } = useTranslate();

  const { registerTr, forgotPassword, loginAccountTr, orTr } = t.regForm;

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
        signupOn ? "registration-form__signup" : "registration-form__login"
      }
      onSubmit={onSubmit}
    >
      {signupOn && (
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
          {signupOn ? loginAccountTr : registerTr}
        </button>
      </div>

      <button
        type="submit"
        className="registration-form__button registration-form__button--primary"
      >
        {signupOn ? registerTr : loginAccountTr}
      </button>

      <div className="registration-form__divider">
        <div className="registration-form__line" />
        <div className="registration-form__or">{orTr}</div>
        <div className="registration-form__line" />
      </div>
    </form>
  );
}
