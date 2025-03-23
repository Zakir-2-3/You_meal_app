"use client";

import Image from "next/image";

import { SubmitHandler, useForm } from "react-hook-form";

import { useEffect, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { activeRegForm } from "@/store/slices/registrationSlice";

import { RegForm } from "@/types/regForm";
import { FORM_ERRORS } from "@/constants/formErrors";

import dd from "@/assets/images/not-found-img.png";
import hidePasswordIcon from "@/assets/icons/hide-password-icon.svg";
import showPasswordIcon from "@/assets/icons/show-password-icon.svg";

import "./RegistrationForm.scss";

const RegistrationForm = () => {
  const [showPassword, setShowPassword] = useState(false); // Состояние для видимости пароля
  const isFormOpen = useSelector(
    (state: RootState) => state.registration.openRegForm
  );
  const dispatch = useDispatch();

  const formRef = useRef<HTMLDivElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegForm>({
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<RegForm> = (data) => {
    console.log(data);
  };

  const handleCloseForm = () => dispatch(activeRegForm(false));

  // Запрещаем пробелы и цифры в поле "Имя"
  const handleNameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === " " || /\d/.test(event.key)) {
      event.preventDefault();
    }
  };

  // Запрещаем пробелы в полях "Почта" и "Пароль"
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === " ") {
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
            <h2 className="registration-form__title">Регистрация</h2>
            <form
              className="registration-form__form"
              onSubmit={handleSubmit(onSubmit)}
            >
              {/* Поле для имени */}
              <div className="registration-form__field">
                <label htmlFor="name" className="registration-form__label">
                  Имя:
                </label>
                <input
                  type="text"
                  id="name"
                  onKeyDown={handleNameKeyDown} // Запрещаем пробелы и цифры
                  {...register("name", {
                    required: FORM_ERRORS.NAME_REQUIRED,
                    pattern: {
                      value: /^[A-Za-zА-Яа-яЁё]+$/, // Только буквы, без пробелов и цифр
                      message: FORM_ERRORS.NAME_INVALID,
                    },
                  })}
                  className="registration-form__input"
                  placeholder="Введите ваше имя"
                />
                {errors.name && (
                  <p className="registration-form__input--error">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Поле для почты */}
              <div className="registration-form__field">
                <label htmlFor="email" className="registration-form__label">
                  Почта:
                </label>
                <input
                  type="email"
                  id="email"
                  onKeyDown={handleKeyDown} // Запрещаем пробелы
                  {...register("email", {
                    required: FORM_ERRORS.EMAIL_REQUIRED,
                    validate: (value) => {
                      const email = String(value); // Преобразуем value в строку
                      if (/^\d/.test(email)) {
                        return FORM_ERRORS.EMAIL_STARTS_WITH_NUMBER; // Проверка на цифру в начале
                      }
                      if (
                        !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,4}$/i.test(
                          email
                        )
                      ) {
                        return FORM_ERRORS.EMAIL_INVALID; // Проверка на корректность email
                      }
                      return true; // Если всё в порядке
                    },
                  })}
                  className="registration-form__input"
                  placeholder="Введите вашу почту"
                />
                {errors.email && (
                  <p className="registration-form__input--error">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Поле для пароля */}
              <div className="registration-form__field">
                <label htmlFor="password" className="registration-form__label">
                  Пароль:
                </label>
                <div className="registration-form__password-container">
                  <input
                    type={showPassword ? "text" : "password"} // Меняем тип поля
                    id="password"
                    {...register("password", {
                      required: FORM_ERRORS.PASSWORD_REQUIRED,
                      minLength: {
                        value: 5,
                        message: FORM_ERRORS.PASSWORD_MIN_LENGTH,
                      },
                      pattern: {
                        value: /^[^0-9][A-Za-z0-9]*$/, // Первый символ не цифра, остальные — буквы и цифры
                        message: FORM_ERRORS.PASSWORD_INVALID,
                      },
                      validate: (value) =>
                        !/\s/.test(String(value)) ||
                        "Пароль не должен содержать пробелов",
                    })}
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
                {errors.password && (
                  <p className="registration-form__input--error">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Кнопка отправки формы */}
              <button
                type="submit"
                className="registration-form__button registration-form__button--primary"
              >
                Зарегистрироваться
              </button>
            </form>
            <div className="registration-form__actions">
              <button
                type="button"
                className="registration-form__button registration-form__button--secondary"
              >
                Уже есть аккаунт? Войти
              </button>
            </div>
          </div>
          <button
            onClick={handleCloseForm}
            className="registration-form__close-btn"
            aria-label="Закрыть форму"
          >
            X
          </button>
        </div>
      </>
    )
  );
};

export default RegistrationForm;
