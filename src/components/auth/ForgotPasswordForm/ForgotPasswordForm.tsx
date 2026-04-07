import { FC, useEffect } from "react";

import EmailStep from "./EmailStep";
import CodeStep from "./CodeStep";

import { useForgotPassword } from "@/hooks/auth/useForgotPassword";

import { Props } from "@/types/components/auth/forgot-password-form";

import "./ForgotPasswordForm.scss";

const ForgotPasswordForm: FC<Props> = ({
  onBack,
  onCompleteReset,
  loadUserData,
}) => {
  const {
    step,
    emailForm,
    codeForm,
    t,
    validationRules,
    canResend,
    attempts,
    formatTime,
    showPassword,
    setShowPassword,
    handleSubmitEmail,
    handleSubmitCode,
    handleResendCode,
  } = useForgotPassword({
    onBack,
    onCompleteReset,
    loadUserData,
  });

  // Сброс формы кода при переходе на шаг кода
  useEffect(() => {
    if (step === "code") {
      codeForm.reset({
        code: "",
        newPassword: "",
        repeatPassword: "",
      });
    }
  }, [step, codeForm]);

  if (step === "email") {
    return (
      <EmailStep
        form={emailForm}
        onSubmit={handleSubmitEmail}
        onBack={onBack}
        t={t}
        validationRules={validationRules}
        canResend={canResend}
      />
    );
  }

  return (
    <CodeStep
      form={codeForm}
      onSubmit={handleSubmitCode}
      onBack={onBack}
      onResendCode={handleResendCode}
      validationRules={validationRules}
      canResend={canResend}
      attempts={attempts}
      formatTime={formatTime}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
    />
  );
};

export default ForgotPasswordForm;
