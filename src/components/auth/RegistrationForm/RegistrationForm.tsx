"use client";

import { useEffect, useRef, useState } from "react";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Image from "next/image";

import { toast } from "react-toastify";
import { SubmitHandler, useForm, FormProvider } from "react-hook-form";

import { useDispatch, useSelector } from "react-redux";
import { RootState, store } from "@/store/store";
import { setItems } from "@/store/slices/cartSlice";
import { setPromoCodes } from "@/store/slices/promoSlice";
import { setBalance, setGeoCity } from "@/store/slices/userSlice";
import {
  setAuthStatus,
  setEmail,
  setName,
  activeRegForm,
  setAvatarUrl,
} from "@/store/slices/userSlice";

import VerifyCodeForm from "../VerifyCodeForm/VerifyCodeForm";
import GoogleLoginButton from "../GoogleLoginButton/GoogleLoginButton";
import LoginOrSignupForm from "../LoginOrSignupForm/LoginOrSignupForm";
import ForgotPasswordForm from "../ForgotPasswordForm/ForgotPasswordForm";
import SetNewPasswordForm from "../SetNewPasswordForm/SetNewPasswordForm";

import { useTranslate } from "@/hooks/useTranslate";
import { useResendTimer } from "@/hooks/useResendTimer";
import { useCleanupOnAuth } from "@/hooks/useCleanupOnAuth";

import { DEFAULT_AVATAR } from "@/constants/defaults";

import { RegForm } from "@/types/regForm";

import CloseButton from "@/ui/buttons/CloseButton";

import notFoundImg from "@/assets/images/not-found-img.png";

import "./RegistrationForm.scss";

const RegistrationForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [signupOn, setSignupOn] = useState(true);
  const [step, setStep] = useState<"form" | "verify" | "set-new-password">(
    "form"
  );
  const [localEmail, setLocalEmail] = useState("");
  const [loginError, setLoginError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [passwordError, setPasswordError] = useState("");
  const [localName, setLocalName] = useState("");
  const [localPassword, setLocalPassword] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotModeOrigin, setForgotModeOrigin] = useState<"login" | "signup">(
    "login"
  );

  const doCleanup = useCleanupOnAuth();

  const { canResend, startTimer, formatTime } = useResendTimer();

  const { t, lang } = useTranslate();

  const { title1, title2, title3 } = t.regForm;

  const {
    passwordUpdated,
    passwordResetError,
    userNotFound,
    loginErrorTr,
    loginSuccess,
    loginOrServerError,
    accountExists,
    tooManyAttemptsTryLater,
    codeAlreadySent,
    codeSendError,
    codeSent,
    registrationError,
    successfulRegistration,
    invalidCode,
  } = t.toastTr;

  const isFormOpen = useSelector((state: any) => state.user.isRegFormOpen);
  const geoCity = useSelector((state: any) => state.user.geoCity);

  const dispatch = useDispatch();
  const pathname = usePathname();
  const formRef = useRef<HTMLDivElement>(null);

  const methods = useForm<RegForm>({ mode: "onChange" });
  const verifyMethods = useForm<{ code: string }>({ mode: "onChange" });

  const { data: session } = useSession();
  const isGoogleUser = session?.user?.image?.includes("googleusercontent");
  const isAuth = useSelector((state: any) => state.user.isAuth);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = methods;

  const {
    register: registerVerify,
    handleSubmit: handleVerifySubmit,
    reset: resetVerify,
    formState: { errors: verifyErrors },
  } = verifyMethods;

  const handleCloseForm = () => dispatch(activeRegForm(false));

  const checkUserExists = async (email: string) => {
    const res = await fetch("/api/user/load", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    return !!data?.email;
  };

  const onSubmit: SubmitHandler<RegForm> = async (data) => {
    if (!signupOn) {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email, password: data.password }),
        });

        if (!res.ok) {
          const errorData = await res.json();

          if (errorData.code === "email_not_found") {
            toast.error(userNotFound);
            setError("email", { type: "server", message: "Почта не найдена" });
          } else if (errorData.code === "invalid_password") {
            setError("password", {
              type: "server",
              message: "Неверный пароль",
            });
          } else {
            toast.error(errorData.message || loginErrorTr);
          }
          return;
        }

        const user = await res.json();

        dispatch(setAuthStatus(true));
        dispatch(setEmail(user.email));
        dispatch(setName(user.name));
        localStorage.removeItem("hasLoggedOut");

        await loadUserData(user.email);

        doCleanup();

        toast.success(loginSuccess);
        dispatch(activeRegForm(false));
      } catch {
        toast.error(loginOrServerError);
      }
    } else {
      try {
        // Проверка, существует ли уже аккаунт
        const exists = await checkUserExists(data.email);
        if (exists) {
          toast.warn(accountExists);
          setSignupOn(false);
          setStep("form");
          reset();
          return;
        }

        // Отправка запроса на регистрацию
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            city: geoCity || localStorage.getItem("city") || "",
            lang,
          }),
        });

        const result = await res.json();

        // Обработка блокировки
        if (res.status === 429) {
          toast.error(result.error || tooManyAttemptsTryLater);
          if (result.blockedUntil) {
            const remaining = Math.ceil(
              (new Date(result.blockedUntil).getTime() - Date.now()) / 1000
            );
            startTimer(remaining);
          }
          return;
        }

        // Если код уже был отправлен ранее — открываем verify-экран
        if (res.status === 208) {
          toast.info(result.message || codeAlreadySent, {
            autoClose: 5000,
          });
          setLocalEmail(data.email);
          setLocalName(data.name);
          setLocalPassword(data.password);
          dispatch(setName(data.name));
          dispatch(setEmail(data.email));
          setStep("verify");

          if (result.blockedUntil) {
            const remaining = Math.ceil(
              (new Date(result.blockedUntil).getTime() - Date.now()) / 1000
            );
            startTimer(remaining);
          }
          return;
        }

        // Если код был отправлен впервые или повторно (после истечения)
        if (!res.ok) {
          toast.error(result.error || codeSendError);
          return;
        }

        toast.success(result.message || codeSent);

        setLocalEmail(data.email);
        setLocalName(data.name);
        setLocalPassword(data.password);
        dispatch(setName(data.name));
        dispatch(setEmail(data.email));
        setStep("verify");

        doCleanup();

        if (result.blockedUntil) {
          const remaining = Math.ceil(
            (new Date(result.blockedUntil).getTime() - Date.now()) / 1000
          );
          startTimer(remaining);
        } else {
          startTimer(10);
        }
      } catch {
        toast.error(registrationError);
      }
    }
  };

  const handleVerifySubmitCode = handleVerifySubmit(async ({ code }) => {
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: localEmail,
          code: String(code),
          city: geoCity || localStorage.getItem("city") || "",
        }),
      });

      if (!res.ok) {
        setAttempts((prev) => prev + 1);
        throw new Error("Код неверен");
      }

      toast.success(successfulRegistration);
      dispatch(setAuthStatus(true));

      localStorage.removeItem("hasLoggedOut");

      // Загружаем актуальные данные пользователя из Supabase
      await loadUserData(localEmail);

      // Загружаем рейтинг и избранные
      // await dispatch(syncUserMetaIfAuth());

      dispatch(activeRegForm(false));
    } catch {
      toast.error(invalidCode);
    }
  });

  const loadUserData = async (email: string) => {
    try {
      const res = await fetch("/api/user/load", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        console.error("Ошибка запроса", await res.text());
        return;
      }

      const data = await res.json();

      if (!data || !data.email) {
        console.warn("Пользователь не найден при загрузке данных.");
        return;
      }

      // Берем корзину из SessionStorage, а не из Redux
      const savedCart = JSON.parse(
        sessionStorage.getItem("googleAuthCart") || "[]"
      );
      const localCart =
        savedCart.length > 0
          ? savedCart
          : (store.getState() as RootState).cart.items;

      // Очищаем SessionStorage после использования
      if (savedCart.length > 0) {
        sessionStorage.removeItem("googleAuthCart");
      }

      const localCity =
        (store.getState() as RootState).user.geoCity ||
        localStorage.getItem("city");

      // Получаем текущий локальный город
      const currentLocalCity = localCity;

      // Получаем город из базы данных
      const dbCity = data.city;

      // Проверка, является ли город пустым
      const isBadCity = (city: string | null): boolean => {
        if (!city) return true;
        return (
          city === "geolocation_disabled" ||
          city === "geolocation_not_supported" ||
          city === t.geo.disabledGeo ||
          city === t.geo.notSupportedGeo ||
          city === "Геолокация отключена" ||
          city === "Geolocation disabled"
        );
      };

      // Проверка, является ли город не пустым
      const isGoodCity = (city: string | null): boolean => {
        return !!city && !isBadCity(city);
      };

      let finalCity = dbCity;

      // В базе пустой город (geolocation_disabled), а локально не пустой
      if (isBadCity(dbCity) && isGoodCity(currentLocalCity)) {
        finalCity = currentLocalCity;

        // Сохраняем не пустой город в базу
        await fetch("/api/user/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            city: currentLocalCity,
          }),
        });
      }
      // В базе пусто, а локально не пустой город
      else if (!dbCity && isGoodCity(currentLocalCity)) {
        finalCity = currentLocalCity;

        // Сохраняем не пустой город в базу
        await fetch("/api/user/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            city: currentLocalCity,
          }),
        });
      }
      // В базе не пустой город - используем его (самый высокий приоритет)
      else if (isGoodCity(dbCity)) {
        finalCity = dbCity;
      }
      // В базе пустой город и локально тоже - оставляем как есть
      else {
        finalCity = dbCity || currentLocalCity;
      }

      // Устанавливаем финальный город
      if (finalCity) {
        dispatch(setGeoCity(finalCity));
        localStorage.setItem("city", finalCity);
      }

      if (!data.cart || data.cart.length === 0) {
        if (localCart.length > 0) {
          // Сохраняем корзину в базу
          await fetch("/api/user/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              cart: localCart,
            }),
          });
          // Восстанавливаем корзину
          dispatch(setItems(localCart));
        } else {
          console.log("Корзина пустая");
        }
      } else {
        // Если в базе есть корзина - используем ее
        dispatch(setItems(data.cart));
      }

      const currentPromoCodes = store.getState().promo;
      let newPromoCodes: { activated: string[]; available: string[] };

      if (
        data.promoCodes &&
        typeof data.promoCodes === "object" &&
        Array.isArray(data.promoCodes.activated) &&
        Array.isArray(data.promoCodes.available)
      ) {
        // Если в базе есть промокоды - используем их
        newPromoCodes = data.promoCodes;
      } else if (
        currentPromoCodes.activated.length > 0 ||
        currentPromoCodes.available.length > 0
      ) {
        // Если в базе пусто, но локально есть промокоды - используем локальные
        newPromoCodes = {
          activated: currentPromoCodes.activated,
          available: currentPromoCodes.available,
        };
      } else {
        // Если везде пусто - используем пустые массивы
        newPromoCodes = { activated: [], available: [] };
      }

      dispatch(setPromoCodes(newPromoCodes));

      dispatch(setBalance(data.balance || 0));
      dispatch(setAvatarUrl(data.avatar || DEFAULT_AVATAR));
    } catch (err) {
      console.error("Ошибка загрузки данных:", err);
    }
  };

  useEffect(() => {
    if (!isFormOpen) return;
    const handler = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        handleCloseForm();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isFormOpen]);

  useEffect(() => {
    dispatch(activeRegForm(false));
  }, [pathname]);

  useEffect(() => {
    if (isFormOpen) reset();
  }, [isFormOpen, reset]);

  useEffect(() => {
    if (session?.user?.email && isGoogleUser && !isAuth) {
      // Восстанавливаем корзину
      const savedCart = JSON.parse(
        sessionStorage.getItem("googleAuthCart") || "[]"
      );
      if (savedCart.length > 0) {
        dispatch(setItems(savedCart));
        sessionStorage.removeItem("googleAuthCart");
      }

      // Устанавливаем данные пользователя
      dispatch(setAuthStatus(true));
      dispatch(setEmail(session.user.email));
      dispatch(setName(session.user.name || ""));
      dispatch(setAvatarUrl(session.user.image || DEFAULT_AVATAR));

      // Загружаем остальные данные
      loadUserData(session.user.email);
    }
  }, [session, isGoogleUser, isAuth, dispatch, loadUserData]);

  if (!isFormOpen) return null;

  return (
    <>
      <div className={`overlay ${isFormOpen ? "overlay--visible" : ""}`} />
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
            {step === "verify"
              ? "Подтвердите почту"
              : step === "set-new-password"
              ? "Восстановление пароля"
              : forgotMode
              ? title3
              : signupOn
              ? title1
              : title2}
          </h2>

          {step === "form" && forgotMode ? (
            <ForgotPasswordForm
              onBack={() => {
                setForgotMode(false);
                setStep("form");
                setSignupOn(forgotModeOrigin === "signup");
              }}
              loadUserData={loadUserData}
              onCompleteReset={(email: string) => {
                setLocalEmail(email);
                setSignupOn(false);
                setForgotMode(false);
                setStep("form");
              }}
            />
          ) : step === "form" ? (
            <FormProvider {...methods}>
              <LoginOrSignupForm
                signupOn={signupOn}
                setSignupOn={setSignupOn}
                setStep={setStep}
                setForgotMode={setForgotMode}
                setForgotModeOrigin={setForgotModeOrigin}
                resetForm={reset}
                passwordError={passwordError}
                setPasswordError={setPasswordError}
                errors={errors}
                register={register}
                showPassword={showPassword}
                togglePassword={() => setShowPassword((prev) => !prev)}
                onForgotPassword={() => {
                  reset();
                  setForgotModeOrigin(signupOn ? "signup" : "login");
                  setForgotMode(true);
                  setSignupOn(false);
                  setStep("form");
                }}
                onSwitchMode={() => {
                  setSignupOn(!signupOn);
                  setStep("form");
                  setLoginError("");
                  reset();
                }}
                onSubmit={handleSubmit(onSubmit)}
              />
            </FormProvider>
          ) : step === "verify" ? (
            <FormProvider {...verifyMethods}>
              <VerifyCodeForm
                canResend={canResend}
                attempts={attempts}
                formatTime={formatTime}
                startTimer={startTimer}
                onSubmit={handleVerifySubmitCode}
                onBack={() => {
                  setStep("form");
                  reset();
                  resetVerify();
                }}
                email={localEmail}
                name={localName}
                password={localPassword}
              />
            </FormProvider>
          ) : step === "set-new-password" ? (
            <SetNewPasswordForm
              email={localEmail}
              onSubmit={async (data) => {
                const res = await fetch("/api/auth/reset-password", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    email: localEmail,
                    password: data.password,
                  }),
                });

                const result = await res.json();

                if (!res.ok) {
                  toast.error(result.message || passwordResetError);
                  return;
                }

                toast.success(passwordUpdated);
                dispatch(setAuthStatus(true));
                dispatch(setEmail(localEmail));
                await loadUserData(localEmail);
                dispatch(activeRegForm(false));
              }}
            />
          ) : null}
          {step === "form" && !forgotMode && <GoogleLoginButton />}
        </div>

        <CloseButton
          onClick={handleCloseForm}
          className="registration-form__close-btn"
          ariaLabel="Закрыть форму"
        />
      </div>
    </>
  );
};

export default RegistrationForm;
