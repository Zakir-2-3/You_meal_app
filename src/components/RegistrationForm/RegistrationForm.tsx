"use client";

import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { useEffect, useRef, useState } from "react";

import { toast } from "react-toastify";

import { SubmitHandler, useForm } from "react-hook-form";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  activeRegForm,
  setAuthStatus,
  setEmail,
  setName,
  setPassword,
} from "@/store/slices/userSlice";

import {
  nameValidation,
  emailValidation,
  passwordValidation,
} from "@/utils/validationRules";

import { RegForm } from "@/types/regForm";

import { FORM_ERRORS } from "@/constants/formErrors";

import dd from "@/assets/images/not-found-img.png";
import hidePasswordIcon from "@/assets/icons/hide-password-icon.svg";
import showPasswordIcon from "@/assets/icons/show-password-icon.svg";
import registrationFormCloseBtnIcon from "@/assets/icons/registration-form-close-btn-icon.svg";

import "./RegistrationForm.scss";

const RegistrationForm = () => {
  const [showPassword, setShowPassword] = useState(false); // Состояние для видимости пароля
  const [signupOn, setSignupOn] = useState(true); // Текс Зарегистрироваться или Войти

  const isFormOpen = useSelector(
    (state: RootState) => state.user.isRegFormOpen
  );
  const dispatch = useDispatch();

  const router = useRouter();
  const pathname = usePathname();

  const formRef = useRef<HTMLDivElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegForm>({
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<RegForm> = (data) => {
    // Сохраняем данные в Redux
    dispatch(setName(data.name));
    dispatch(setEmail(data.email));
    dispatch(setPassword(data.password));
    dispatch(setAuthStatus(true));

    toast.success("Аккаунт успешно создан!");
    router.push("/user");
  };

  const handleCloseForm = () => dispatch(activeRegForm(false));

  // Запрещаем пробелы и цифры в поле "Имя"
  const handleNameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === " " || /\d/.test(event.key)) {
      event.preventDefault();
    }
  };

  // Запрещаем пробелы и цифры в начале поля "Почта" и "Пароль"
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart;

    // Запрещаем пробелы
    if (event.key === " ") {
      event.preventDefault();
    }

    // Запрещаем цифры в начале поля
    if (/\d/.test(event.key) && cursorPosition === 0) {
      event.preventDefault();
    }
  };

  useEffect(() => {
    if (!isFormOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        handleCloseForm();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFormOpen]);

  // Закрываем форму при загрузке и переходах
  useEffect(() => {
    dispatch(activeRegForm(false));
  }, [pathname]);

  // Очищаем поля инпут
  useEffect(() => {
    if (isFormOpen) {
      reset(); // очищает все поля формы
    }
  }, [isFormOpen, reset]);

  // Если форма закрыта, не рендерим её
  if (!isFormOpen) return null;

  return (
    isFormOpen && (
      <>
        <div className={`overlay ${isFormOpen ? "overlay--visible" : ""}`} />

        <div className="registration-form" ref={formRef}>
          <div className="registration-form__image-container">
            <Image
              src={dd}
              className="registration-form__image"
              width={300}
              height={300}
              alt="Изображение"
            />
          </div>
          <div className="registration-form__content">
            <h2 className="registration-form__title">
              {signupOn ? "Регистрация" : "Войти в аккаунт"}
            </h2>
            <form
              className="registration-form__form"
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* Поле для имени */}
              <div
                className="registration-form__field"
                style={{
                  display: signupOn ? "block" : "none",
                }}
              >
                <label htmlFor="name" className="registration-form__label">
                  Имя:
                </label>
                {errors.name && (
                  <p className="registration-form__input--error">
                    {errors.name.message}
                  </p>
                )}
                <input
                  type="text"
                  id="name"
                  onKeyDown={handleNameKeyDown} // Запрещаем пробелы и цифры
                  {...register("name", nameValidation)}
                  className="registration-form__input"
                  placeholder="Введите ваше имя"
                />
              </div>

              {/* Поле для почты */}
              <div className="registration-form__field">
                <label htmlFor="email" className="registration-form__label">
                  Почта:
                </label>
                {errors.email && (
                  <p className="registration-form__input--error">
                    {errors.email.message}
                  </p>
                )}
                <input
                  type="email"
                  id="email"
                  onKeyDown={handleKeyDown} // Запрещаем пробелы и цифры в начале
                  {...register("email", emailValidation)}
                  className="registration-form__input"
                  placeholder="Введите вашу почту"
                />
              </div>

              {/* Поле для пароля */}
              <div className="registration-form__field">
                <label htmlFor="password" className="registration-form__label">
                  Пароль:
                </label>
                {errors.password && (
                  <p className="registration-form__input--error">
                    {errors.password.message}
                  </p>
                )}
                <div className="registration-form__password-container">
                  <input
                    type={showPassword ? "text" : "password"} // Меняем тип поля
                    id="password"
                    onKeyDown={handleKeyDown} // Запрещаем пробелы и цифры в начале
                    {...register("password", passwordValidation)}
                    className="registration-form__input"
                    placeholder="Введите пароль"
                  />
                  <button
                    type="button"
                    className="registration-form__toggle-password"
                    onClick={() => setShowPassword(!showPassword)} // Переключаем видимость
                  >
                    {showPassword ? (
                      <Image
                        src={showPasswordIcon}
                        width={20}
                        height={20}
                        alt="Показать пароль"
                      />
                    ) : (
                      <Image
                        src={hidePasswordIcon}
                        width={20}
                        height={20}
                        alt="Скрыть пароль"
                      />
                    )}
                  </button>
                </div>

                {/* Кнопка "Забыли пароль?" */}
                <button
                  type="button"
                  className="registration-form__forgot"
                  style={{ display: signupOn ? "none" : "block" }}
                >
                  Забыли пароль?
                </button>
              </div>

              {/* Кнопка отправки формы */}
              <button
                type="submit"
                className="registration-form__button registration-form__button--primary"
                style={{ background: signupOn ? "#28a745" : "#007bff" }}
              >
                {signupOn ? "Зарегистрироваться" : "Войти"}
              </button>

              {/* Переключение на Вход */}
              <div className="registration-form__actions">
                <span className="registration-form__text-switch">
                  {signupOn ? "Уже есть аккаунт?" : "Еще нет аккаунта?"}
                </span>
                <button
                  type="button"
                  onClick={() => setSignupOn((prev) => !prev)}
                  className="registration-form__button--secondary"
                >
                  {signupOn ? "Войти" : "Зарегистрироваться"}
                </button>
              </div>
            </form>
          </div>
          <button
            onClick={handleCloseForm}
            className="registration-form__close-btn"
            aria-label="Закрыть форму"
          >
            <Image
              src={registrationFormCloseBtnIcon}
              alt="registration-form-close-btn-icon"
              width={30}
              height={30}
            />
          </button>
        </div>
      </>
    )
  );
};

export default RegistrationForm;
