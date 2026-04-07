import { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";

import { UserFormData, UserFormValidation } from "@/types/user/form";

export interface PasswordFieldProps {
  editMode: boolean;
  isGoogleUser: boolean;
  showPassword: boolean;
  register: UseFormRegister<UserFormData>;
  errors: FieldErrors<UserFormData>;
  validationRules: UserFormValidation;
  watch: UseFormWatch<UserFormData>;
  passwordSameError: string;
  onToggleShowPassword: () => void;
  translations: {
    passwordLabel: string;
    newPasswordUserLabel: string;
    repeatPasswordPlaceholder: string;
    passwordUnavailableHint: string;
  };
}
