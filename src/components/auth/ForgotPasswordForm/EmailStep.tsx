import { FC } from "react";

import { EmailStepProps } from "@/types/components/auth/forgot-password-form";

const EmailStep: FC<EmailStepProps> = ({
  form,
  onSubmit,
  onBack,
  t,
  validationRules,
  canResend,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form
      className="registration-form__forgot registration-form__forgot--email"
      onSubmit={handleSubmit(onSubmit)}
    >
      <label className="registration-form__label" htmlFor="forgot-email">
        {t.regForm.forgotPasswordLabel}
      </label>
      <input
        id="forgot-email"
        type="email"
        placeholder={t.user.emailPlaceholder}
        className="registration-form__input"
        {...register("email", validationRules.emailValidation)}
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
          disabled={!canResend}
        >
          {t.regForm.sendCodeBtn}
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

export default EmailStep;
