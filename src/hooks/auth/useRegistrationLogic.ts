import { useCallback, useState } from "react";

import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  setAuthStatus,
  setEmail,
  setName,
  activeRegForm,
} from "@/store/slices/userSlice";

import { useTranslate } from "@/hooks/app/useTranslate";
import { useResendTimer } from "@/hooks/app/useResendTimer";
import { useCleanupOnAuth } from "@/hooks/app/useCleanupOnAuth";

import { syncUserMetaIfAuth } from "@/utils/user/syncUserMeta";

import { RegForm } from "@/types/auth/user-data";
import {
  UseRegistrationLogicProps,
  UseRegistrationLogicReturn,
} from "@/types/auth/registration";

export const useRegistrationLogic = ({
  loadUserData,
  ui,
}: UseRegistrationLogicProps): UseRegistrationLogicReturn => {
  const { t, lang } = useTranslate();
  const dispatch = useDispatch<AppDispatch>();

  const doCleanup = useCleanupOnAuth();
  const { canResend, startTimer, formatTime } = useResendTimer();

  const [attempts, setAttempts] = useState(0);

  const methods = useForm<RegForm>({ mode: "onChange" });
  const verifyMethods = useForm<{ code: string }>({ mode: "onChange" });

  const { setError, reset } = methods;
  const { reset: resetVerify } = verifyMethods;

  const handleSignInError = useCallback(
    (errorData: any) => {
      if (errorData.code === "email_not_found") {
        toast.error(t.toastTr.userNotFound);
        setError("email", { type: "server", message: "Mail not found" });
      } else if (errorData.code === "invalid_password") {
        setError("password", { type: "server", message: "Invalid password" });
      } else {
        toast.error(errorData.message || t.toastTr.signInErrorTr);
      }
    },
    [t, setError],
  );

  const handleSuccessfulAuth = useCallback(
    async (user: any) => {
      dispatch(setAuthStatus(true));
      dispatch(setEmail(user.email));
      dispatch(setName(user.name));
      localStorage.removeItem("hasSignedOut");
      await loadUserData(user.email);
      doCleanup();
      toast.success(t.toastTr.signInSuccess);
      dispatch(activeRegForm(false));
      dispatch(syncUserMetaIfAuth());
    },
    [dispatch, loadUserData, doCleanup, t],
  );

  const handleRegistrationResponse = useCallback(
    async (data: RegForm, res: Response, result: any) => {
      if (res.status === 429) {
        toast.error(result.error || t.toastTr.tooManyAttemptsTryLater);
        if (result.blockedUntil) {
          const remaining = Math.ceil(
            (new Date(result.blockedUntil).getTime() - Date.now()) / 1000,
          );
          startTimer(remaining);
        }
        return;
      }

      if (res.status === 208) {
        toast.info(result.message || t.toastTr.codeAlreadySent, {
          autoClose: 5000,
        });
        ui.setLocalEmail(data.email);
        ui.setLocalName(data.name);
        ui.setLocalPassword(data.password);
        dispatch(setName(data.name));
        dispatch(setEmail(data.email));
        ui.setStep("verify");

        if (result.blockedUntil) {
          const remaining = Math.ceil(
            (new Date(result.blockedUntil).getTime() - Date.now()) / 1000,
          );
          startTimer(remaining);
        }
        return;
      }

      if (!res.ok) {
        toast.error(result.error || t.toastTr.codeSendError);
        return;
      }

      toast.success(result.message || t.toastTr.codeSent);
      ui.setLocalEmail(data.email);
      ui.setLocalName(data.name);
      ui.setLocalPassword(data.password);
      dispatch(setName(data.name));
      dispatch(setEmail(data.email));
      ui.setStep("verify");
      doCleanup();

      if (result.blockedUntil) {
        const remaining = Math.ceil(
          (new Date(result.blockedUntil).getTime() - Date.now()) / 1000,
        );
        startTimer(remaining);
      } else {
        startTimer(10);
      }
    },
    [t, startTimer, ui, dispatch, doCleanup],
  );

  const handleSignIn = useCallback(
    async (data: RegForm) => {
      try {
        const res = await fetch("/api/auth/sign-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email, password: data.password }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          handleSignInError(errorData);
          return;
        }

        const user = await res.json();
        await handleSuccessfulAuth(user);
      } catch {
        toast.error(t.toastTr.signInOrServerError);
      }
    },
    [handleSignInError, handleSuccessfulAuth, t],
  );

  const handleSignUp = useCallback(
    async (data: RegForm) => {
      try {
        // Просто отправляем запрос на регистрацию
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            city: ui.geoCity || localStorage.getItem("city") || "",
            lang,
          }),
        });

        const result = await res.json();
        await handleRegistrationResponse(data, res, result);
      } catch {
        toast.error(t.toastTr.registrationError);
      }
    },
    [t, ui, lang, reset, handleRegistrationResponse],
  );

  const handleSubmitForm = useCallback(
    async (data: RegForm) => {
      if (ui.isSignUpMode) {
        await handleSignUp(data);
      } else {
        await handleSignIn(data);
      }
    },
    [ui.isSignUpMode, handleSignUp, handleSignIn],
  );

  const handleVerifySubmit = useCallback(
    async ({ code }: { code: string }) => {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: ui.localEmail,
            code: String(code),
            city: ui.geoCity || localStorage.getItem("city") || "",
          }),
        });

        if (!res.ok) {
          setAttempts((prev) => prev + 1);
          throw new Error("Code is incorrect");
        }

        toast.success(t.toastTr.successfulRegistration);
        dispatch(setAuthStatus(true));
        localStorage.removeItem("hasSignedOut");
        await loadUserData(ui.localEmail);
        dispatch(activeRegForm(false));
        dispatch(syncUserMetaIfAuth());
      } catch {
        toast.error(t.toastTr.invalidCode);
      }
    },
    [ui.localEmail, ui.geoCity, t, dispatch, loadUserData],
  );

  return {
    methods,
    verifyMethods,
    handleSubmitForm,
    handleVerifySubmit,
    canResend,
    startTimer,
    formatTime,
    attempts,
    setAttempts,
    doCleanup,
    t,
  };
};
