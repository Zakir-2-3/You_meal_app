import { UseFormReturn } from "react-hook-form";

export interface Props {
  onBack: () => void;
  onCompleteReset: (email: string) => void;
  loadUserData: (email: string) => Promise<void>;
}

export interface ForgotFormData {
  email: string;
}

export interface CodeStepData {
  code: string;
  newPassword: string;
  repeatPassword: string;
}

export interface UseForgotPasswordProps {
  onBack: () => void;
  onCompleteReset: (email: string) => void;
  loadUserData: (email: string) => Promise<void>;
}

export interface UseForgotPasswordReturn {
  step: "email" | "code";
  emailInput: string;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  attempts: number;
  canResend: boolean;
  formatTime: () => string;
  emailForm: UseFormReturn<ForgotFormData>;
  codeForm: UseFormReturn<CodeStepData>;
  t: any;
  validationRules: any;
  handleSubmitEmail: (data: ForgotFormData) => Promise<void>;
  handleSubmitCode: (data: CodeStepData) => Promise<void>;
  handleResendCode: () => Promise<void>;
}

export interface EmailStepProps {
  form: UseFormReturn<ForgotFormData>;
  onSubmit: (data: ForgotFormData) => Promise<void>;
  onBack: () => void;
  t: any;
  validationRules: any;
  canResend: boolean;
}

export interface CodeStepProps {
  form: UseFormReturn<CodeStepData>;
  onSubmit: (data: CodeStepData) => Promise<void>;
  onBack: () => void;
  onResendCode: () => Promise<void>;
  validationRules: any;
  canResend: boolean;
  attempts: number;
  formatTime: () => string;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
}
