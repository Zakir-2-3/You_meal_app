"use client";

import { useEffect, useRef } from "react";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

import { toast } from "react-toastify";
import { FormProvider } from "react-hook-form";

import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setItems } from "@/store/slices/cartSlice";
import {
  setAuthStatus,
  setEmail,
  setAvatarUrl,
} from "@/store/slices/userSlice";

import { useTranslate } from "@/hooks/app/useTranslate";
import { useUserDataLoader } from "@/hooks/auth/useUserDataLoader";
import { useRegistrationUI } from "@/hooks/auth/useRegistrationUI";
import { useRegistrationLogic } from "@/hooks/auth/useRegistrationLogic";

import VerifyCodeForm from "../VerifyCodeForm/VerifyCodeForm";
import GoogleSignInButton from "../GoogleSignInButton/GoogleSignInButton";
import SignInOrSignUpForm from "../SignInOrSignUpForm/SignInOrSignUpForm";
import ForgotPasswordForm from "../ForgotPasswordForm/ForgotPasswordForm";
import SetNewPasswordForm from "../SetNewPasswordForm/SetNewPasswordForm";

import { syncUserMetaIfAuth } from "@/utils/user/syncUserMeta";

import { DEFAULT_AVATAR } from "@/constants/user/defaults";

import CloseButton from "@/UI/buttons/CloseButton/CloseButton";

import notFoundImg from "@/assets/images/not-found-img.png";

import "./RegistrationForm.scss";

const RegistrationForm = () => {
  const { t } = useTranslate();

  const { loadUserData } = useUserDataLoader();
  const ui = useRegistrationUI();

  const dispatch = useDispatch<AppDispatch>();

  const geoCity = useSelector((state: RootState) => state.user.geoCity);

  const logic = useRegistrationLogic({
    loadUserData,
    ui: {
      isSignUpMode: ui.isSignUpMode,
      setStep: ui.setStep,
      setLocalEmail: ui.setLocalEmail,
      setLocalName: ui.setLocalName,
      setLocalPassword: ui.setLocalPassword,
      setSignInError: ui.setSignInError,
      setPasswordError: ui.setPasswordError,
      geoCity,
      localEmail: ui.localEmail,
      localName: ui.localName,
      localPassword: ui.localPassword,
    },
  });

  const { data: session } = useSession();
  const isGoogleUser = session?.user?.image?.includes("googleusercontent");
  const isAuth = useSelector((state: RootState) => state.user.isAuth);
  const pathname = usePathname();
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ui.isFormOpen) return;
    const handler = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        ui.handleCloseForm();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ui.isFormOpen, ui.handleCloseForm]);

  useEffect(() => {
    ui.handleCloseForm();
  }, [pathname, ui.handleCloseForm]);

  useEffect(() => {
    if (ui.isFormOpen) {
      logic.methods.reset();
    }
  }, [ui.isFormOpen, logic.methods]);

  useEffect(() => {
    if (
      sessionStorage.getItem("__sign_out_in_progress") === "true" ||
      sessionStorage.getItem("__account_deleting") === "true" ||
      localStorage.getItem("hasSignedOut") === "true"
    ) {
      return;
    }

    if (session?.user?.email && isGoogleUser && !isAuth) {
      const savedCart = JSON.parse(
        sessionStorage.getItem("googleAuthCart") || "[]",
      );

      if (savedCart.length > 0) {
        dispatch(setItems(savedCart));
        sessionStorage.removeItem("googleAuthCart");
      }

      dispatch(setAuthStatus(true));
      dispatch(setEmail(session.user.email));
      dispatch(setAvatarUrl(session.user.image || DEFAULT_AVATAR));
      loadUserData(session.user.email);
      dispatch(syncUserMetaIfAuth());
    }
  }, [session, isGoogleUser, isAuth, dispatch, loadUserData]);

  const handleSetNewPasswordSubmit = async (data: { password: string }) => {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: ui.localEmail,
        password: data.password,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      toast.error(result.message || t.toastTr.passwordResetError);
      return;
    }

    toast.success(t.toastTr.passwordUpdated);
    dispatch(setAuthStatus(true));
    dispatch(setEmail(ui.localEmail));
    await loadUserData(ui.localEmail);
    ui.handleCloseForm();
    dispatch(syncUserMetaIfAuth());
  };

  if (!ui.isFormOpen) return null;

  return (
    <>
      <div className={`overlay ${ui.isFormOpen ? "overlay--visible" : ""}`} />
      <div className="registration-form" ref={formRef}>
        <div className="registration-form__image-container">
          <Image
            src={notFoundImg}
            className="registration-form__image"
            width={300}
            height={300}
            alt="registration-from-img"
          />
        </div>

        <div className="registration-form__content">
          <h2 className="registration-form__title">
            {ui.step === "verify"
              ? t.regForm.title4
              : ui.step === "set-new-password"
                ? t.regForm.title3
                : ui.forgotMode
                  ? t.regForm.title3
                  : ui.isSignUpMode
                    ? t.regForm.title1
                    : t.regForm.title2}
          </h2>

          {ui.step === "form" && ui.forgotMode ? (
            <ForgotPasswordForm
              onBack={ui.exitForgotMode}
              loadUserData={loadUserData}
              onCompleteReset={(email: string) => {
                ui.setLocalEmail(email);
                ui.setIsSignUpMode(false);
                ui.setForgotMode(false);
                ui.setStep("form");
              }}
            />
          ) : ui.step === "form" ? (
            <FormProvider {...logic.methods}>
              <SignInOrSignUpForm
                isSignUpMode={ui.isSignUpMode}
                setIsSignUpMode={ui.setIsSignUpMode}
                setStep={ui.setStep}
                setForgotMode={ui.setForgotMode}
                setForgotModeOrigin={ui.setForgotModeOrigin}
                resetForm={logic.methods.reset}
                passwordError={ui.passwordError}
                setPasswordError={ui.setPasswordError}
                errors={logic.methods.formState.errors}
                register={logic.methods.register}
                showPassword={ui.showPassword}
                togglePassword={ui.togglePassword}
                onForgotPassword={() => {
                  logic.methods.reset();
                  ui.enterForgotMode(ui.isSignUpMode ? "sign-up" : "sign-in");
                }}
                onSwitchMode={ui.switchMode}
                onSubmit={logic.methods.handleSubmit(logic.handleSubmitForm)}
              />
            </FormProvider>
          ) : ui.step === "verify" ? (
            <FormProvider {...logic.verifyMethods}>
              <VerifyCodeForm
                canResend={logic.canResend}
                attempts={logic.attempts}
                formatTime={logic.formatTime}
                startTimer={logic.startTimer}
                onSubmit={logic.verifyMethods.handleSubmit(
                  logic.handleVerifySubmit,
                )}
                onBack={() => {
                  ui.setStep("form");
                  logic.methods.reset();
                  logic.verifyMethods.reset();
                }}
                email={ui.localEmail}
                name={ui.localName}
                password={ui.localPassword}
              />
            </FormProvider>
          ) : ui.step === "set-new-password" ? (
            <SetNewPasswordForm
              email={ui.localEmail}
              onSubmit={handleSetNewPasswordSubmit}
            />
          ) : null}

          {ui.step === "form" && !ui.forgotMode && <GoogleSignInButton />}
        </div>

        <CloseButton
          onClick={ui.handleCloseForm}
          className="registration-form__close-btn"
          ariaLabel={t.buttons.closeFormAriaLabel}
        />
      </div>
    </>
  );
};

export default RegistrationForm;
