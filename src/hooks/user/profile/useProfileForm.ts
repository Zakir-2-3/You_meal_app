import { useState, useEffect } from "react";
import { toast } from "react-toastify";

import { setName } from "@/store/slices/userSlice";

import { supabase } from "@/lib/supabase/supabaseClient";

import { UserFormData } from "@/types/user/form";
import {
  UseProfileFormProps,
  UseProfileFormReturn,
} from "@/types/hooks/profile-form";

export const useProfileForm = ({
  email,
  name: currentName,
  dispatch,
  watch,
  trigger,
  reset,
  translations,
}: UseProfileFormProps): UseProfileFormReturn => {
  const [nameSameError, setNameSameError] = useState("");
  const [passwordSameError, setPasswordSameError] = useState("");
  const [lastCheckedName, setLastCheckedName] = useState<string | null>(null);
  const [lastCheckedPassword, setLastCheckedPassword] = useState<string | null>(
    null,
  );
  const [isChecking, setIsChecking] = useState(false);

  // Эффект для watch (очистка ошибок при изменении)
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "newPassword") {
        trigger("repeatPassword");
        setPasswordSameError("");
      }
      if (name === "name") {
        setNameSameError("");
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, trigger]);

  const handleProfileSubmit = async (
    data: UserFormData,
    dirtyFields: Partial<Record<keyof UserFormData, boolean>>,
  ) => {
    // Проверка паролей
    if (data.newPassword && data.newPassword !== data.repeatPassword) {
      return;
    }

    // Проверка: не те ли данные уже выдавали совпадение
    if (
      nameSameError &&
      lastCheckedName === data.name.trim() &&
      data.name.trim() !== ""
    ) {
      return;
    }

    if (
      passwordSameError &&
      lastCheckedPassword === data.newPassword &&
      data.newPassword !== ""
    ) {
      return;
    }

    if (!email) {
      toast.error("Email not found");
      return;
    }

    setIsChecking(true);

    try {
      // Проверка уникальности на сервере
      const checkRes = await fetch("/api/user/check-updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          newName: data.name.trim(),
          newPassword: data.newPassword || "",
        }),
      });

      if (!checkRes.ok) throw new Error("Data validation error");

      const checkData = await checkRes.json();

      const nameSame = checkData.nameSame && data.name.trim() !== "";
      const passwordSame = checkData.passwordSame && data.newPassword !== "";

      setNameSameError(nameSame ? "The name matches the current one" : "");
      setPasswordSameError(
        passwordSame ? "The password matches the current one" : "",
      );

      setLastCheckedName(data.name.trim());
      setLastCheckedPassword(data.newPassword);

      // Если есть совпадения, то не сохраняем
      if (nameSame || passwordSame) {
        setIsChecking(false);
        return;
      }

      let updated = false;

      // Обновление имени в Supabase и Redux
      if (dirtyFields.name && data.name.trim()) {
        const { error: updateError } = await supabase
          .from("users")
          .update({ name: data.name.trim() })
          .eq("email", email);

        if (updateError) {
          toast.error(translations.nameUpdateFailed);
          console.error(updateError.message);
          return;
        }

        dispatch(setName(data.name.trim()));
        updated = true;
      }

      // Смена пароля
      if (data.newPassword) {
        try {
          const res = await fetch("/api/auth/change-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, newPassword: data.newPassword }),
          });

          if (!res.ok) throw new Error("Error changing password");

          updated = true;
        } catch (err) {
          console.error(err);
          toast.error(translations.passwordChangeFailed);
          return;
        }
      }

      // Успешное обновление
      if (updated) {
        toast.success(translations.dataUpdatedSuccess);
        reset({
          name: data.name.trim(),
          email: data.email,
          newPassword: "",
          repeatPassword: "",
        });
        setLastCheckedName(null);
        setLastCheckedPassword(null);
      }
    } catch (err) {
      console.error("Error checking for updates:", err);
      toast.error(translations.dataValidationError);
    } finally {
      setIsChecking(false);
    }
  };

  return {
    nameSameError,
    passwordSameError,
    lastCheckedName,
    lastCheckedPassword,
    isChecking,
    setNameSameError,
    setPasswordSameError,
    setIsChecking,
    handleProfileSubmit,
  };
};
