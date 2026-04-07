import { useState, useCallback } from "react";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { activeRegForm } from "@/store/slices/userSlice";

import { AuthStep, ForgotOrigin } from "@/types/auth/registration";

export const useRegistrationUI = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(true);
  const [step, setStep] = useState<AuthStep>("form");
  const [localEmail, setLocalEmail] = useState("");
  const [localName, setLocalName] = useState("");
  const [localPassword, setLocalPassword] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotModeOrigin, setForgotModeOrigin] =
    useState<ForgotOrigin>("sign-in");
  const [signInError, setSignInError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const isFormOpen = useSelector(
    (state: RootState) => state.user.isRegFormOpen,
  );
  const dispatch = useDispatch<AppDispatch>();

  const handleCloseForm = useCallback(() => {
    dispatch(activeRegForm(false));
  }, [dispatch]);

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const switchMode = useCallback(() => {
    setIsSignUpMode((prev) => !prev);
    setSignInError("");
  }, []);

  const enterForgotMode = useCallback((origin: ForgotOrigin) => {
    setForgotModeOrigin(origin);
    setForgotMode(true);
    setIsSignUpMode(false);
    setStep("form");
  }, []);

  const exitForgotMode = useCallback(() => {
    setForgotMode(false);
    setIsSignUpMode(forgotModeOrigin === "sign-up");
  }, [forgotModeOrigin]);

  return {
    showPassword,
    isSignUpMode,
    step,
    localEmail,
    localName,
    localPassword,
    forgotMode,
    forgotModeOrigin,
    signInError,
    passwordError,
    isFormOpen,
    setShowPassword,
    setIsSignUpMode,
    setStep,
    setLocalEmail,
    setLocalName,
    setLocalPassword,
    setForgotMode,
    setForgotModeOrigin,
    setSignInError,
    setPasswordError,
    handleCloseForm,
    togglePassword,
    switchMode,
    enterForgotMode,
    exitForgotMode,
  };
};
