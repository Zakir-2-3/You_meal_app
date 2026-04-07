import { FC, useEffect } from "react";

import { useTranslate } from "@/hooks/app/useTranslate";

import TogglePasswordButton from "@/UI/inputs/TogglePasswordButton";

import { CodeStepProps } from "@/types/components/auth/forgot-password-form";

const CodeStep: FC<CodeStepProps> = ({
  form,
  onSubmit,
  onBack,
  onResendCode,
  validationRules,
  canResend,
  attempts,
  formatTime,
  showPassword,
  setShowPassword,
}) => {
  const { t } = useTranslate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = form;

  // Следим за изменением пароля для валидации повторного ввода
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "newPassword") {
        trigger("repeatPassword");
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, trigger]);

  return (
    <form
      className="registration-form__forgot registration-form__forgot--code"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Поле для кода */}
      <label className="registration-form__label" htmlFor="code">
        {t.regForm.codeFromEmailLabel}
      </label>
      <input
        id="code"
        type="text"
        placeholder={t.regForm.sixDigitCode}
        className="registration-form__input"
        {...register("code", {
          required: t.user.enterCode,
          pattern: {
            value: /^\d{6}$/,
            message: t.regForm.sixDigitCodeMail,
          },
        })}
      />
      {errors.code && (
        <p className="registration-form__forgot-error registration-form__forgot-error--code1">
          {errors.code.message}
        </p>
      )}

      {/* Кнопка повторной отправки */}
      {canResend ? (
        <button
          type="button"
          className="registration-form__button registration-form__button--secondary registration-form__forgot--repeat-btn"
          onClick={onResendCode}
        >
          {t.regForm.resendCode}
        </button>
      ) : (
        <p className="registration-form__label">
          {attempts >= 2
            ? `${t.toastTr.tooManyAttemptsTryLater} ${formatTime()}`
            : `${t.regForm.resendVia} ${formatTime()}`}
        </p>
      )}

      {/* Поле нового пароля */}
      <label className="registration-form__label" htmlFor="new-password">
        {t.regForm.newPasswordLabel}
      </label>
      <div className="registration-form__password-container">
        <input
          id="new-password"
          type={showPassword ? "text" : "password"}
          className="registration-form__input"
          placeholder={t.user.enterNewPasswordPlaceholder}
          {...register("newPassword", validationRules.passwordValidation)}
        />
        <TogglePasswordButton
          visible={showPassword}
          onToggle={() => setShowPassword(!showPassword)}
        />
      </div>
      {errors.newPassword && (
        <p className="registration-form__forgot-error registration-form__forgot-error--code2">
          {errors.newPassword.message}
        </p>
      )}

      {/* Подтверждение пароля */}
      <input
        type={showPassword ? "text" : "password"}
        placeholder={t.user.repeatPasswordPlaceholder}
        className="registration-form__input"
        {...register("repeatPassword", {
          validate: (val) =>
            val === watch("newPassword") || t.formErrors.PASSWORDS_NOT_MATCH,
        })}
      />
      {errors.repeatPassword && (
        <p className="registration-form__forgot-error registration-form__forgot-error--code3">
          {errors.repeatPassword.message}
        </p>
      )}

      {/* Кнопки */}
      <div className="registration-form__buttons-group">
        <button
          type="submit"
          className="registration-form__button registration-form__button--primary"
        >
          {t.regForm.changePasswordBtn}
        </button>
        <button
          type="button"
          className="registration-form__button registration-form__button--secondary"
          onClick={onBack}
        >
          {t.regForm.backBtn}
        </button>
      </div>
    </form>
  );
};

export default CodeStep;
