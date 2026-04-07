import { UseFormWatch, UseFormTrigger, UseFormReset } from "react-hook-form";

import { AppDispatch } from "@/store/store";

import { UserFormData } from "@/types/user/form";

export interface UseProfileFormProps {
  email: string | null;
  name: string;
  dispatch: AppDispatch;
  watch: UseFormWatch<UserFormData>;
  trigger: UseFormTrigger<UserFormData>;
  reset: UseFormReset<UserFormData>;
  translations: {
    nameUpdateFailed: string;
    passwordChangeFailed: string;
    dataUpdatedSuccess: string;
    dataValidationError: string;
  };
}

export interface UseProfileFormReturn {
  nameSameError: string;
  passwordSameError: string;
  lastCheckedName: string | null;
  lastCheckedPassword: string | null;
  isChecking: boolean;
  setNameSameError: (error: string) => void;
  setPasswordSameError: (error: string) => void;
  setIsChecking: (checking: boolean) => void;
  handleProfileSubmit: (
    data: UserFormData,
    dirtyFields: Partial<Record<keyof UserFormData, boolean>>,
  ) => Promise<void>;
}
