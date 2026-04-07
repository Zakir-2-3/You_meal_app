import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormTrigger,
  UseFormHandleSubmit,
} from "react-hook-form";

export interface UserFormData {
  name: string;
  email: string;
  newPassword: string;
  repeatPassword: string;
}

export interface UserFormErrors {
  nameSameError: string;
  passwordSameError: string;
}

export interface UserFormValidation {
  nameEditValidation: any;
  optionalPasswordEditValidation: any;
  repeatPasswordEditValidation: (getNewPassword: () => string) => any;
}

export interface ProfileFormProps {
  name: string;
  email: string;
  isGoogleUser: boolean;
  isAuth: boolean;

  lang: string;

  editMode: boolean;
  showPassword: boolean;
  nameSameError: string;
  passwordSameError: string;
  isChecking: boolean;
  lastCheckedName: string | null;
  lastCheckedPassword: string | null;

  onSubmit: (data: UserFormData) => Promise<void>;
  onToggleEditMode: () => void;
  onToggleShowPassword: () => void;
  onResetForm: () => void;

  validationRules: UserFormValidation;

  register: UseFormRegister<UserFormData>;
  handleSubmit: UseFormHandleSubmit<UserFormData>;
  errors: FieldErrors<UserFormData>;
  watch: UseFormWatch<UserFormData>;
  trigger: UseFormTrigger<UserFormData>;
  isValid: boolean;
  isDirty: boolean;
  dirtyFields: Partial<Record<keyof UserFormData, boolean>>;

  translations: {
    nameLabel: string;
    emailLabel: string;
    passwordLabel: string;
    newPasswordUserLabel: string;
    repeatPasswordPlaceholder: string;
    namePlaceholder: string;
    save: string;
    editTr: string;
    cancelTr: string;
    passwordUnavailableHint: string;
  };
}
