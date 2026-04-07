import { useFormContext } from "react-hook-form";

import { useTranslate } from "@/hooks/app/useTranslate";

import { Props } from "@/types/components/auth/set-new-password-form";

export default function SetNewPasswordForm({ email, onSubmit }: Props) {
  const { t } = useTranslate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useFormContext<{ password: string; repeatPassword: string }>();

  return (
    <form
      className="registration-form__reset"
      onSubmit={handleSubmit(onSubmit)}
    >
      <label className="registration-form__label" htmlFor="reset-password">
        {t.regForm.newPasswordLabel}
      </label>
      <input
        id="reset-password"
        type="password"
        className="registration-form__input"
        placeholder={t.user.enterNewPasswordPlaceholder}
        {...register("password", {
          required: t.user.passwordPlaceholder,
          minLength: { value: 6, message: `${t.regForm.minSixChar}` },
        })}
      />
      {typeof errors.password?.message === "string" && (
        <p className="registration-form__input--error">
          {errors.password.message}
        </p>
      )}

      <label className="registration-form__label" htmlFor="repeat-password">
        {t.regForm.repeatPasswordLabel}
      </label>
      <input
        id="repeat-password"
        type="password"
        className="registration-form__input"
        placeholder={t.user.repeatPasswordPlaceholder}
        {...register("repeatPassword", {
          validate: (val) =>
            val === watch("password") || t.formErrors.PASSWORDS_NOT_MATCH,
        })}
      />
      {typeof errors.repeatPassword?.message === "string" && (
        <p className="registration-form__input--error">
          {errors.repeatPassword.message}
        </p>
      )}

      <div className="registration-form__buttons-group">
        <button
          type="submit"
          className="registration-form__button registration-form__button--primary"
        >
          {t.regForm.resetPasswordAndSignIn}
        </button>
      </div>
    </form>
  );
}
