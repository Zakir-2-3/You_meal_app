import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { useDispatch } from "react-redux";
import {
  activeRegForm,
  setAuthStatus,
  setEmail,
  setName,
} from "@/store/slices/userSlice";

import { emailValidation, passwordValidation } from "@/utils/validationRules";

import { useResendTimer } from "@/hooks/useResendTimer";

import TogglePasswordButton from "@/ui/inputs/TogglePasswordButton";

import "./ForgotPasswordForm.scss";

type Props = {
  onBack: () => void;
  onCompleteReset: (email: string) => void;
  loadUserData: (email: string) => Promise<void>;
};

type ForgotFormData = {
  email: string;
};

type CodeStepData = {
  code: string;
  newPassword: string;
  repeatPassword: string;
};

const ForgotPasswordForm = ({
  onBack,
  onCompleteReset,
  loadUserData,
}: Props) => {
  const [step, setStep] = useState<"email" | "code">("email");
  const [attempts, setAttempts] = useState(0);
  const [emailInput, setEmailInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    canResend,
    secondsLeft: resendTimer,
    startTimer,
    formatTime,
  } = useResendTimer(10, false);

  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotFormData>({ mode: "onChange" });

  const {
    register: registerCode,
    handleSubmit: handleCodeSubmit,
    reset: resetCodeForm,
    formState: { errors: codeErrors },
    watch: watchCode,
    trigger: triggerCode,
  } = useForm<CodeStepData>({ mode: "onChange" });

  const onSubmitEmail = async (data: ForgotFormData) => {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await res.json();

      if (res.status === 429) {
        toast.error(result.message || "Слишком много попыток.");
        setEmailInput(data.email);
        setStep("code");
        resetCodeForm();

        if (result.blockedUntil) {
          const remaining = Math.ceil(
            (new Date(result.blockedUntil).getTime() - Date.now()) / 1000
          );
          startTimer(remaining);
        }
        return;
      }

      if (res.status === 403) {
        toast.info(
          result.error || "Почта ещё не подтверждена. Завершите регистрацию."
        );
        return;
      }

      if (res.status === 404) {
        toast.error(result.error || "Пользователь с таким email не найден");
        setError("email", { type: "server", message: "Почта не найдена" });
        return;
      }

      if (!res.ok) {
        toast.error(result.message || "Ошибка при отправке кода");
        return;
      }

      toast.success(result.message || "Код отправлен на почту");

      setEmailInput(data.email);
      setStep("code");

      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);

      if (nextAttempts >= 2) {
        startTimer(7200);
      } else {
        startTimer(10);
      }
    } catch {
      toast.error("Ошибка отправки кода");
    }
  };

  const onSubmitCode = async (data: CodeStepData) => {
    if (data.newPassword !== data.repeatPassword) {
      return toast.error("Пароли не совпадают");
    }

    try {
      // Смена пароля
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput,
          code: data.code,
          newPassword: data.newPassword,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Неверный код или ошибка сервера");
        return;
      }

      // Вход
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, password: data.newPassword }),
      });

      if (!loginRes.ok) {
        toast.error("Пароль сменён, но вход не выполнен");
        return;
      }

      const user = await loginRes.json();
      dispatch(setAuthStatus(true));
      dispatch(setEmail(user.email));
      dispatch(setName(user.name));
      localStorage.removeItem("hasLoggedOut");
      await loadUserData(user.email);

      toast.success("Вы успешно вошли");
      onCompleteReset(user.email);
      dispatch(activeRegForm(false));
    } catch {
      toast.error("Ошибка восстановления пароля");
    }
  };

  useEffect(() => {
    if (step === "code") {
      // Очищаем поле "code" при переходе к шагу ввода кода
      resetCodeForm({ code: "", newPassword: "", repeatPassword: "" });
    }
  }, [step]);

  useEffect(() => {
    const subscription = watchCode((value, { name }) => {
      if (name === "newPassword") {
        triggerCode("repeatPassword");
      }
    });
    return () => subscription.unsubscribe();
  }, [watchCode, triggerCode]);

  if (step === "email") {
    return (
      <form
        className="registration-form__forgot registration-form__forgot--email"
        onSubmit={handleSubmit(onSubmitEmail)}
      >
        <label className="registration-form__label" htmlFor="forgot-email">
          Введите почту для восстановления:
        </label>
        <input
          id="forgot-email"
          type="email"
          placeholder="Введите почту"
          className="registration-form__input"
          {...register("email", emailValidation)}
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
            Отправить код
          </button>
          <button
            type="button"
            className="registration-form__button registration-form__button--secondary"
            onClick={onBack}
          >
            Назад
          </button>
        </div>
      </form>
    );
  }

  return (
    <form
      className="registration-form__forgot registration-form__forgot--code"
      onSubmit={handleCodeSubmit(onSubmitCode)}
    >
      <label className="registration-form__label" htmlFor="code">
        Код из почты:
      </label>
      <input
        id="code"
        type="text"
        placeholder="6-значный код"
        className="registration-form__input"
        {...registerCode("code", {
          required: "Введите код",
          pattern: { value: /^\d{6}$/, message: "Код должен содержать 6 цифр" },
        })}
      />
      {codeErrors.code && (
        <p className="registration-form__forgot-error registration-form__forgot-error--code1">
          {codeErrors.code.message}
        </p>
      )}

      {canResend ? (
        <button
          type="button"
          className="registration-form__button registration-form__button--secondary registration-form__forgot--repeat-btn"
          onClick={async () => {
            try {
              const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailInput }),
              });
              const result = await res.json();

              if (!res.ok) {
                toast.error(result.message || "Ошибка повторной отправки");
                return;
              }

              const nextAttempts = attempts + 1;
              setAttempts(nextAttempts);

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
          }}
        >
          Отправить код повторно
        </button>
      ) : (
        <p className="registration-form__label">
          {attempts >= 2
            ? `Слишком много попыток. Повторно через ${formatTime()}`
            : `Повторная отправка через ${formatTime()}`}
        </p>
      )}

      <label className="registration-form__label" htmlFor="new-password">
        Новый пароль:
      </label>
      <div className="registration-form__password-container">
        <input
          id="new-password"
          type={showPassword ? "text" : "password"}
          className="registration-form__input"
          placeholder="Введите новый пароль"
          {...registerCode("newPassword", passwordValidation)}
        />
        <TogglePasswordButton
          visible={showPassword}
          onToggle={() => setShowPassword((prev) => !prev)}
        />
      </div>
      {codeErrors.newPassword && (
        <p className="registration-form__forgot-error registration-form__forgot-error--code2">
          {codeErrors.newPassword.message}
        </p>
      )}

      <input
        type={showPassword ? "text" : "password"}
        placeholder="Повторите пароль"
        className="registration-form__input"
        {...registerCode("repeatPassword", {
          validate: (val) =>
            val === watchCode("newPassword") || "Пароли не совпадают",
        })}
      />
      {codeErrors.repeatPassword && (
        <p className="registration-form__forgot-error registration-form__forgot-error--code3">
          {codeErrors.repeatPassword.message}
        </p>
      )}

      <div className="registration-form__buttons-group">
        <button
          type="submit"
          className="registration-form__button registration-form__button--primary"
        >
          Сменить пароль
        </button>
        <button
          type="button"
          className="registration-form__button registration-form__button--secondary"
          onClick={onBack}
        >
          Назад
        </button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
