import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  activeRegForm,
  setAuthStatus,
  setEmail,
  setName,
} from "@/store/slices/userSlice";

import { createValidationRules } from "@/utils/auth/validationRules";

import { useResendTimer } from "@/hooks/app/useResendTimer";
import { useTranslate } from "@/hooks/app/useTranslate";

import {
  ForgotFormData,
  CodeStepData,
  UseForgotPasswordProps,
  UseForgotPasswordReturn,
} from "@/types/components/auth/forgot-password-form";

export const useForgotPassword = ({
  onCompleteReset,
  loadUserData,
}: UseForgotPasswordProps): UseForgotPasswordReturn => {
  const [step, setStep] = useState<"email" | "code">("email");
  const [attempts, setAttempts] = useState(0);
  const [emailInput, setEmailInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { t } = useTranslate();
  const dispatch = useDispatch<AppDispatch>();

  const {
    canResend,
    secondsLeft: resendTimer,
    startTimer,
    formatTime,
  } = useResendTimer(10, false);

  const validationRules = createValidationRules(t.formErrors);

  const emailForm = useForm<ForgotFormData>({ mode: "onChange" });

  const codeForm = useForm<CodeStepData>({ mode: "onChange" });

  // Логика отправки email
  const handleSubmitEmail = async (data: ForgotFormData) => {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await res.json();

      if (res.status === 429) {
        toast.error(result.message || t.toastTr.tooManyAttempts);
        setEmailInput(data.email);
        setStep("code");
        codeForm.reset();

        if (result.blockedUntil) {
          const remaining = Math.ceil(
            (new Date(result.blockedUntil).getTime() - Date.now()) / 1000,
          );
          startTimer(remaining);
        }
        return;
      }

      if (res.status === 403) {
        toast.info(result.error || t.toastTr.emailNotVerified);
        return;
      }

      if (res.status === 404) {
        toast.error(result.error || t.toastTr.userNotFound);
        emailForm.setError("email", {
          type: "server",
          message: "Mail not found",
        });
        return;
      }

      if (!res.ok) {
        toast.error(result.message || t.toastTr.codeSendError);
        return;
      }

      toast.success(result.message || t.toastTr.codeSent);
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
      toast.error(t.toastTr.errorSendingCode);
    }
  };

  // Логика отправки кода и смены пароля
  const handleSubmitCode = async (data: CodeStepData) => {
    if (data.newPassword !== data.repeatPassword) {
      toast.error(t.toastTr.passwordsNotMatch);
      return;
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
        toast.error(result.message || t.toastTr.invalidCode);
        return;
      }

      // Автоматический вход
      const signInRes = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput,
          password: data.newPassword,
        }),
      });

      if (!signInRes.ok) {
        toast.error(t.toastTr.passwordChangedButNoSignIn);
        return;
      }

      const user = await signInRes.json();
      dispatch(setAuthStatus(true));
      dispatch(setEmail(user.email));
      dispatch(setName(user.name));
      localStorage.removeItem("hasLoggedOut");
      await loadUserData(user.email);

      toast.success(t.toastTr.signInSuccess);
      onCompleteReset(user.email);
      dispatch(activeRegForm(false));
    } catch {
      toast.error(t.toastTr.passwordRecoveryError);
    }
  };

  // Логика повторной отправки кода
  const handleResendCode = async () => {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || t.toastTr.resendError);
        return;
      }

      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);

      if (nextAttempts >= 2) {
        startTimer(7200);
        toast.error(t.toastTr.tooManyAttemptsTryLater);
      } else {
        startTimer(10);
        toast.success(result.message || t.toastTr.codeResent);
      }
    } catch {
      toast.error(t.toastTr.resendError);
    }
  };

  return {
    step,
    emailInput,
    showPassword,
    setShowPassword,
    attempts,
    canResend,
    formatTime,
    emailForm,
    codeForm,
    t,
    validationRules,
    handleSubmitEmail,
    handleSubmitCode,
    handleResendCode,
  };
};
