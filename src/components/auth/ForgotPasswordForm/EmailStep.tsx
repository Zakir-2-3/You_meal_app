import { FC, useState } from "react";

import { formatEmail } from "@/utils/auth/formatEmail";

import { EmailStepProps } from "@/types/components/auth/forgot-password-form";

const EmailStep: FC<EmailStepProps> = ({
  form,
  onSubmit,
  onBack,
  t,
  validationRules,
  canResend,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = form;

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatEmail(e.target.value);
    setValue("email", formatted, { shouldValidate: true });
  };

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const formatted = formatEmail(e.target.value);
    setValue("email", formatted, { shouldValidate: true });
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

  return (
    <form
      className="registration-form__forgot registration-form__forgot--email"
      onSubmit={handleFormSubmit}
    >
      <label className="registration-form__label" htmlFor="forgot-email">
        {t.regForm.forgotPasswordLabel}
      </label>
      <input
        id="forgot-email"
        type="email"
        placeholder={t.user.emailPlaceholder}
        className="registration-form__input"
        {...register("email", {
          ...validationRules.emailValidation,
          onChange: handleEmailChange,
          onBlur: handleEmailBlur,
        })}
        disabled={isSubmitting}
      />
      {errors.email && (
        <p className="registration-form__forgot-error registration-form__forgot-error--email">
          {errors.email.message}
        </p>
      )}

      <div className="registration-form__buttons-group">
        <button
          type="submit"
          className="registration-form__button registration-form__button--primary"
          disabled={!canResend || isSubmitting}
        >
          {t.regForm.sendCodeBtn}
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

export default EmailStep;
