import { useCallback, useState } from "react";

import { toast } from "react-toastify";
import { useFormContext } from "react-hook-form";

import CodeInput from "@/components/auth/CodeInput/CodeInput";

import { useTranslate } from "@/hooks/app/useTranslate";

import { Props } from "@/types/components/auth/verify-code-form";

export default function VerifyCodeForm({
  email,
  name,
  password,
  attempts,
  canResend,
  startTimer,
  formatTime,
  onBack,
  onSubmit,
  setAttempts,
}: Props) {
  const { t } = useTranslate();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { resendVia, resendCode, backBtn, confirmBtn } = t.regForm;
  const { enterCode } = t.user;
  const { codeResent, codeAlreadySent, tooManyAttemptsTryLater, resendError } =
    t.toastTr;

  const {
    register: registerVerify,
    handleSubmit,
    formState: { errors: verifyErrors },
    setValue,
    watch,
  } = useFormContext();

  const handleResendCode = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          password,
          isResend: true,
        }),
      });

      const result = await res.json();

      if (res.status === 208) {
        toast.info(result.message || codeAlreadySent);
        return;
      }

      if (res.status === 429) {
        toast.error(result.error || tooManyAttemptsTryLater);
        if (result.blockedUntil) {
          const remaining = Math.ceil(
            (new Date(result.blockedUntil).getTime() - Date.now()) / 1000,
          );
          startTimer(remaining);
        }
        return;
      }

      if (!res.ok) {
        toast.error(result.error || resendError);
        return;
      }

      const updatedAttempts = result.attempts ?? attempts + 1;
      setAttempts(updatedAttempts);
      setValue("code", "", { shouldValidate: false });

      if (updatedAttempts >= 3) {
        toast.success(result.message || codeResent);
        startTimer(7200);
        toast.error(tooManyAttemptsTryLater);
      } else {
        startTimer(10);
        toast.success(result.message || codeResent);
      }
    } catch {
      toast.error(resendError);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Оборачиваем onSubmit, чтобы заблокировать кнопку Подтвердить
  const handleFormSubmit = async (
    e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await handleSubmit(onSubmit)(e);
    } catch {
      // ошибки уже обработаны в onSubmit
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeChange = useCallback(
    (val: string) => {
      setValue("code", val, { shouldValidate: true });
    },
    [setValue],
  );

  return (
    <form className="registration-form__verify" onSubmit={handleFormSubmit}>
      <label className="registration-form__label" htmlFor="code">
        {enterCode}
      </label>
      <input
        type="hidden"
        {...registerVerify("code", {
          required: t.regForm.enterCodeEmail,
          pattern: {
            value: /^\d{6}$/,
            message: t.regForm.enterSixDigitCode,
          },
        })}
      />
      <CodeInput
        id="code"
        value={watch("code") || ""}
        onChange={handleCodeChange}
        disabled={isSubmitting}
      />
      {typeof verifyErrors.code?.message === "string" && (
        <p className="registration-form__input--error">
          {verifyErrors.code.message}
        </p>
      )}

      {!canResend ? (
        <p className="registration-form__label">
          {attempts >= 3
            ? `${t.toastTr.tooManyAttempts} ${formatTime()}`
            : `${resendVia} ${formatTime()}`}
        </p>
      ) : (
        <button
          type="button"
          className="registration-form__button registration-form__button--secondary"
          onClick={handleResendCode}
          disabled={isSubmitting || !canResend}
        >
          {resendCode}
        </button>
      )}

      <div className="registration-form__buttons-group">
        <button
          type="submit"
          className="registration-form__button registration-form__button--primary"
          disabled={isSubmitting}
        >
          {confirmBtn}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="registration-form__button registration-form__button--secondary"
          disabled={isSubmitting}
        >
          {backBtn}
        </button>
      </div>
    </form>
  );
}
