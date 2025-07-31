import { useFormContext } from "react-hook-form";

import { toast } from "react-toastify";

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
        toast.info(result.message || "Код уже был отправлен.");
        return;
      }

      if (res.status === 429) {
        toast.error(result.error || "Слишком много попыток. Попробуйте позже.");
        if (result.blockedUntil) {
          const remaining = Math.ceil(
            (new Date(result.blockedUntil).getTime() - Date.now()) / 1000
          );
          startTimer(remaining);
        }
        return;
      }

      if (!res.ok) {
        toast.error(result.error || "Ошибка повторной отправки");
        return;
      }

      const nextAttempts = attempts + 1;

      if (nextAttempts >= 2) {
        startTimer(7200);
        toast.error("Слишком много попыток. Попробуйте позже.");
      } else {
        startTimer(10);
        toast.success(result.message || "Код повторно отправлен");
      }
    } catch {
      toast.error("Ошибка повторной отправки");
    }
  };

  return (
    <form
      className="registration-form__verify"
      onSubmit={handleSubmit(onSubmit)}
    >
      <label className="registration-form__label" htmlFor="code">
        Введите код:
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
        placeholder="Код из почты"
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
            : `Повторная отправка через: ${formatTime()}`}
        </p>
      ) : (
        <button
          type="button"
          className="registration-form__button registration-form__button--secondary"
          onClick={handleResendCode}
        >
          Отправить код повторно
        </button>
      )}

      <div className="registration-form__buttons-group">
        <button
          type="submit"
          className="registration-form__button registration-form__button--primary"
        >
          Подтвердить
        </button>
        <button
          type="button"
          onClick={onBack}
          className="registration-form__button registration-form__button--secondary"
        >
          Назад
        </button>
      </div>
    </form>
  );
}
