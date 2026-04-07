import { FieldErrors, UseFormRegister } from "react-hook-form";

import { RegForm } from "@/types/auth/user-data";

export interface Props {
  isSignUpMode: boolean;
  setIsSignUpMode: (value: boolean) => void;
  setStep: (step: "form" | "verify" | "set-new-password") => void;
  setForgotMode: (value: boolean) => void;
  setForgotModeOrigin: (origin: "sign-in" | "sign-up") => void;
  resetForm: () => void;
  passwordError: string;
  setPasswordError: (msg: string) => void;
  errors: FieldErrors<RegForm>;
  register: UseFormRegister<RegForm>;
  showPassword: boolean;
  togglePassword: () => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => void;
  onForgotPassword: () => void;
  onSwitchMode: () => void;
}
