import { useFormContext } from "react-hook-form";

import { toast } from "react-toastify";

import { useTranslate } from "@/hooks/useTranslate";

type Props = {
  email: string;
  name: string;
  password: string;
  attempts: number;
  canResend: boolean;
  startTimer: (duration: number) => void;
  formatTime: () => string;
  onBack: () => void;
  onSubmit: () => void;
};

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
}: Props) {
  const { t } = useTranslate();

  const { resendVia, resendCode, backBtn, confirmBtn } = t.regForm;
  const { codeFromEmailPlaceholder, enterCode } = t.user;
  const { codeResent, codeAlreadySent, tooManyAttemptsTryLater, resendError } =
    t.toastTr;

  const {
    register: registerVerify,
    handleSubmit,
    formState: { errors: verifyErrors },
  } = useFormContext();

  const handleResendCode = async () => {
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
            (new Date(result.blockedUntil).getTime() - Date.now()) / 1000
          );
          startTimer(remaining);
        }
        return;
      }

      if (!res.ok) {
        toast.error(result.error || resendError);
        return;
      }

      const nextAttempts = attempts + 1;

      if (nextAttempts >= 2) {
        startTimer(7200);
        toast.error(tooManyAttemptsTryLater);
      } else {
        startTimer(10);
        toast.success(result.message || codeResent);
      }
    } catch {
      toast.error(resendError);
    }
  };

  return (
    <form
      className="registration-form__verify"
      onSubmit={handleSubmit(onSubmit)}
    >
      <label className="registration-form__label" htmlFor="code">
        {enterCode}
      </label>
      <input
        id="code"
        type="text"
        {...registerVerify("code", {
          required: "Введите код",
          validate: (value) =>
            /^\d{6}$/.test(value) || "Введите 6-значный код из цифр",
        })}
        className="registration-form__input"
        placeholder={codeFromEmailPlaceholder}
      />
      {typeof verifyErrors.code?.message === "string" && (
        <p className="registration-form__input--error">
          {verifyErrors.code.message}
        </p>
      )}

      {!canResend ? (
        <p className="registration-form__label">
          {attempts >= 2
            ? `Слишком много попыток. ${formatTime()}`
            : `${resendVia} ${formatTime()}`}
        </p>
      ) : (
        <button
          type="button"
          className="registration-form__button registration-form__button--secondary"
          onClick={handleResendCode}
        >
          {resendCode}
        </button>
      )}

      <div className="registration-form__buttons-group">
        <button
          type="submit"
          className="registration-form__button registration-form__button--primary"
        >
          {confirmBtn}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="registration-form__button registration-form__button--secondary"
        >
          {backBtn}
        </button>
      </div>
    </form>
  );
}
