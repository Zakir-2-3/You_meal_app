import { FC, useEffect, useState } from "react";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    setValue,
  } = form;

  useEffect(() => {
    const subscription = watch((_, { name }) => {
      if (name === "newPassword") {
        trigger("repeatPassword");
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, trigger]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
    setValue("code", digits, { shouldValidate: true });
  };

  const handleFormSubmit = async (
    e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await handleSubmit(onSubmit)(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRepeatClick = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onResendCode();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="registration-form__forgot registration-form__forgot--code"
      onSubmit={handleFormSubmit}
    >
      <label className="registration-form__label" htmlFor="code">
        {t.regForm.codeFromEmailLabel}
      </label>
      <input
        id="code"
        type="text"
        maxLength={6}
        placeholder={t.regForm.sixDigitCode}
        className="registration-form__input"
        {...register("code", {
          required: t.regForm.enterCodeEmail,
          pattern: {
            value: /^\d{6}$/,
            message: t.regForm.sixDigitCodeMail,
          },
          onChange: handleCodeChange,
        })}
        disabled={isSubmitting}
      />
      {errors.code && (
        <p className="registration-form__forgot-error registration-form__forgot-error--code1">
          {errors.code.message}
        </p>
      )}

      {canResend ? (
        <button
          type="button"
          className="registration-form__button registration-form__button--secondary registration-form__forgot--repeat-btn"
          onClick={handleRepeatClick}
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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

      <input
        type={showPassword ? "text" : "password"}
        placeholder={t.user.repeatPasswordPlaceholder}
        className="registration-form__input"
        {...register("repeatPassword", {
          validate: (val) =>
            val === watch("newPassword") || t.formErrors.PASSWORDS_NOT_MATCH,
        })}
        disabled={isSubmitting}
      />
      {errors.repeatPassword && (
        <p className="registration-form__forgot-error registration-form__forgot-error--code3">
          {errors.repeatPassword.message}
        </p>
      )}

      <div className="registration-form__buttons-group">
        <button
          type="submit"
          className="registration-form__button registration-form__button--primary"
          disabled={isSubmitting}
        >
          {t.regForm.changePasswordBtn}
        </button>
        <button
          type="button"
          className="registration-form__button registration-form__button--secondary"
          onClick={onBack}
          disabled={isSubmitting}
        >
          {t.regForm.backBtn}
        </button>
      </div>
    </form>
  );
};

export default CodeStep;
