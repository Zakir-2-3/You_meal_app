import { FieldErrors, UseFormRegister } from "react-hook-form";

import GoogleLoginButton from "../GoogleLoginButton/GoogleLoginButton";

import {
  emailValidation,
  nameValidation,
  passwordValidation,
} from "@/utils/validationRules";

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
            Имя:
          </label>
          <input
            id="name"
            type="text"
            {...register("name", nameValidation)}
            className="registration-form__input"
            placeholder="Введите имя"
          />
          {typeof errors.name?.message === "string" && (
            <p className="registration-form__input--error">
              {errors.name.message}
            </p>
          )}
        </div>
      )}

      <div className="registration-form__field">
        <label className="registration-form__label" htmlFor="email">
          Почта:
        </label>
        <input
          id="email"
          type="email"
          {...register("email", emailValidation)}
          className="registration-form__input"
          placeholder="Введите почту"
        />
        {typeof errors.email?.message === "string" && (
          <p className="registration-form__input--error">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="registration-form__field">
        <label className="registration-form__label" htmlFor="password">
          Пароль:
        </label>
        <div className="registration-form__password-container">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password", passwordValidation)}
            className="registration-form__input"
            placeholder="Введите пароль"
          />
          <TogglePasswordButton
            visible={showPassword}
            onToggle={togglePassword}
          />
        </div>
        {typeof errors.password?.message === "string" && (
          <p className="registration-form__input--error">
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
          Забыли пароль?
        </button>

        <button
          type="button"
          onClick={onSwitchMode}
          className="registration-form__button--secondary"
        >
          {signupOn ? "Войти в аккаунт" : "Зарегистрироваться"}
        </button>
      </div>

      <button
        type="submit"
        className="registration-form__button registration-form__button--primary"
      >
        {signupOn ? "Зарегистрироваться" : "Войти в аккаунт"}
      </button>

      <div className="registration-form__divider">
        <div className="registration-form__line" />
        <div className="registration-form__or">ИЛИ</div>
        <div className="registration-form__line" />
      </div>
    </form>
  );
}
