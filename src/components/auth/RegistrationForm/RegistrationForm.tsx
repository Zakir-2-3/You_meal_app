"use client";

import { useEffect, useRef, useState } from "react";

import { usePathname } from "next/navigation";
import Image from "next/image";

import { toast } from "react-toastify";
import { SubmitHandler, useForm, FormProvider } from "react-hook-form";

import { useDispatch, useSelector } from "react-redux";
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

import GoogleLoginButton from "../GoogleLoginButton/GoogleLoginButton";
import ForgotPasswordForm from "../ForgotPasswordForm/ForgotPasswordForm";
import LoginOrSignupForm from "../LoginOrSignupForm/LoginOrSignupForm";
import VerifyCodeForm from "../VerifyCodeForm/VerifyCodeForm";
import SetNewPasswordForm from "../SetNewPasswordForm/SetNewPasswordForm";

import { useResendTimer } from "@/hooks/useResendTimer";

import { syncUserMetaIfAuth } from "@/utils/syncUserMeta";

import { DEFAULT_AVATAR } from "@/constants/defaults";

import { RegForm } from "@/types/regForm";

import CloseButton from "@/ui/buttons/CloseButton";

import notFoundImg from "@/assets/images/not-found-img.png";

import "./RegistrationForm.scss";
import { RootState, store } from "@/store/store";

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

  const { canResend, startTimer, formatTime } = useResendTimer();

  const isFormOpen = useSelector((state: any) => state.user.isRegFormOpen);
  const geoCity = useSelector((state: any) => state.user.geoCity);

  const dispatch = useDispatch();
  const pathname = usePathname();
  const formRef = useRef<HTMLDivElement>(null);

  const methods = useForm<RegForm>({ mode: "onChange" });
  const verifyMethods = useForm<{ code: string }>({ mode: "onChange" });

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
            toast.error("Пользователь с таким email не найден");
            setError("email", { type: "server", message: "Почта не найдена" });
          } else if (errorData.code === "invalid_password") {
            setError("password", {
              type: "server",
              message: "Неверный пароль",
            });
          } else {
            toast.error(errorData.message || "Ошибка входа");
          }
          return;
        }

        const user = await res.json();
        dispatch(setAuthStatus(true));
        dispatch(setEmail(user.email));
        dispatch(setName(user.name));
        localStorage.removeItem("hasLoggedOut");
        await loadUserData(user.email);
        toast.success("Вы успешно вошли");
        dispatch(activeRegForm(false));
      } catch {
        toast.error("Ошибка входа или сервер недоступен");
      }
    } else {
      try {
        // Проверка, существует ли уже аккаунт
        const exists = await checkUserExists(data.email);
        if (exists) {
          toast.warn("Аккаунт уже существует");
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
          }),
        });

        const result = await res.json();

        // Обработка блокировки
        if (res.status === 429) {
          toast.error(
            result.error || "Слишком много попыток. Попробуйте позже."
          );
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
          toast.info(
            result.message || "Код уже был отправлен. Проверьте почту",
            {
              autoClose: 5000,
            }
          );
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
          toast.error(result.error || "Ошибка при отправке кода");
          return;
        }

        toast.success(result.message || "Код отправлен на почту");

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
        } else {
          startTimer(10);
        }
      } catch {
        toast.error("Ошибка при регистрации");
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

      toast.success("Успешная регистрация");
      dispatch(setAuthStatus(true));

      localStorage.removeItem("hasLoggedOut");

      // Загружаем актуальные данные пользователя из Supabase
      await loadUserData(localEmail);

      // Загружаем рейтинг и избранные
      await dispatch(syncUserMetaIfAuth());

      dispatch(activeRegForm(false));
    } catch {
      toast.error("Неверный код или ошибка сервера");
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

      const localCart = (store.getState() as RootState).cart.items;

      if (!data.cart || data.cart.length === 0) {
        if (localCart.length > 0) {
          // Заливаем локальные данные в Supabase
          await fetch("/api/user/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              cart: localCart,
            }),
          });

          dispatch(setItems(localCart));
          console.log("Локальная корзина перенесена в Supabase:", localCart);
        } else {
          dispatch(setItems([]));
        }
      } else {
        dispatch(setItems(data.cart));
      }

      dispatch(setPromoCodes(data.promoCodes || []));

      dispatch(setBalance(data.balance || 0));

      dispatch(setAvatarUrl(data.avatar || DEFAULT_AVATAR));

      if (data.city) {
        dispatch(setGeoCity(data.city));
        localStorage.setItem("city", data.city);
        console.log("Город из базы:", data.city);
      }
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
            alt="Изображение"
          />
        </div>

        <div className="registration-form__content">
          <h2 className="registration-form__title">
            {step === "verify"
              ? "Подтвердите почту"
              : signupOn
              ? "Регистрация"
              : "Войти"}
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
                  toast.error(result.message || "Ошибка при сбросе пароля");
                  return;
                }

                toast.success("Пароль успешно обновлён!");
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
