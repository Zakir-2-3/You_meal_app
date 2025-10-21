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

import { createValidationRules } from "@/utils/validationRules";

import { useResendTimer } from "@/hooks/useResendTimer";
import { useTranslate } from "@/hooks/useTranslate";

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

  const { t } = useTranslate();

  const {
    emailPlaceholder,
    enterNewPasswordPlaceholder,
    repeatPasswordPlaceholder,
  } = t.user;

  const {
    forgotPasswordLabel,
    sendCodeBtn,
    backBtn,
    resendVia,
    codeFromEmailLabel,
    sixDigitCode,
    newPasswordLabel,
    changePasswordBtn,
    resendCode,
  } = t.regForm;

  const {
    tooManyAttempts,
    resendError,
    emailNotVerified,
    userNotFound,
    codeSendError,
    codeSent,
    passwordsNotMatch,
    invalidCode,
    passwordChangedButNoLogin,
    loginSuccess,
    passwordRecoveryError,
    tooManyAttemptsTryLater,
    codeResent,
    errorSendingCode,
  } = t.toastTr;

  const validationRules = createValidationRules(t.formErrors);

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
        toast.error(result.message || tooManyAttempts);
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
        toast.info(result.error || emailNotVerified);
        return;
      }

      if (res.status === 404) {
        toast.error(result.error || userNotFound);
        setError("email", { type: "server", message: "Почта не найдена" });
        return;
      }

      if (!res.ok) {
        toast.error(result.message || codeSendError);
        return;
      }

      toast.success(result.message || codeSent);

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
      toast.error(errorSendingCode);
    }
  };

  const onSubmitCode = async (data: CodeStepData) => {
    if (data.newPassword !== data.repeatPassword) {
      return toast.error(passwordsNotMatch);
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
        toast.error(result.message || invalidCode);
        return;
      }

      // Вход
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, password: data.newPassword }),
      });

      if (!loginRes.ok) {
        toast.error(passwordChangedButNoLogin);
        return;
      }

      const user = await loginRes.json();
      dispatch(setAuthStatus(true));
      dispatch(setEmail(user.email));
      dispatch(setName(user.name));
      localStorage.removeItem("hasLoggedOut");
      await loadUserData(user.email);

      toast.success(loginSuccess);
      onCompleteReset(user.email);
      dispatch(activeRegForm(false));
    } catch {
      toast.error(passwordRecoveryError);
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
          {forgotPasswordLabel}
        </label>
        <input
          id="forgot-email"
          type="email"
          placeholder={emailPlaceholder}
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
            {sendCodeBtn}
          </button>
          <button
            type="button"
            className="registration-form__button registration-form__button--secondary"
            onClick={onBack}
          >
            {backBtn}
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
        {codeFromEmailLabel}
      </label>
      <input
        id="code"
        type="text"
        placeholder={sixDigitCode}
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
                toast.error(result.message || resendError);
                return;
              }

              const nextAttempts = attempts + 1;
              setAttempts(nextAttempts);

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
          }}
        >
          {resendCode}
        </button>
      ) : (
        <p className="registration-form__label">
          {attempts >= 2
            ? `Слишком много попыток. Повторно через ${formatTime()}`
            : `${resendVia} ${formatTime()}`}
        </p>
      )}

      <label className="registration-form__label" htmlFor="new-password">
        {newPasswordLabel}
      </label>
      <div className="registration-form__password-container">
        <input
          id="new-password"
          type={showPassword ? "text" : "password"}
          className="registration-form__input"
          placeholder={enterNewPasswordPlaceholder}
          {...registerCode("newPassword", validationRules.passwordValidation)}
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
        placeholder={repeatPasswordPlaceholder}
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
          {changePasswordBtn}
        </button>
        <button
          type="button"
          className="registration-form__button registration-form__button--secondary"
          onClick={onBack}
        >
          {backBtn}
        </button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
