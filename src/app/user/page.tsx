"use client";

import { useState, useRef, useEffect } from "react";

import Image from "next/image";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  setAvatar,
  setEmail,
  setName,
  setPassword,
} from "@/store/slices/userSlice";
import { activatePromo, removePromo } from "@/store/slices/promoSlice";

import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import {
  nameValidation,
  emailValidation,
  passwordValidation,
  optionalPasswordValidation,
  repeatPasswordValidation,
} from "@/utils/validationRules";

import AvatarUploader from "@/components/AvatarUploader/AvatarUploader";
import NavButtons from "@/components/NavButtons/NavButtons";
import NotFoundPage from "@/app/not-found";

import { logout } from "@/utils/logout";

import {
  DEFAULT_AVATAR,
  DEFAULT_PROMOS,
  PROMO_DESCRIPTIONS,
} from "@/constants/defaults";

import hidePasswordIcon from "@/assets/icons/hide-password-icon.svg";
import showPasswordIcon from "@/assets/icons/show-password-icon.svg";
import listPromoCodeIcon from "@/assets/icons/list-promo-code-icon.svg";

import "./userPage.scss";

export default function UserPage() {
  const [showPassword, setShowPassword] = useState(false); // Состояние для видимости пароля
  const [showAvatarUploader, setShowAvatarUploader] = useState(false); // Состояние для видимости окна загрузки изображения
  const [avatarVisible, setAvatarVisible] = useState(true);
  const [promoInput, setPromoInput] = useState("");
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [removingPromo, setRemovingPromo] = useState<string | null>(null);

  const promoListRef = useRef<HTMLDivElement | null>(null);

  const { name, email, password, balance, avatar, isAuth } = useSelector(
    (state: RootState) => state.user
  );
  const { available, activated } = useSelector(
    (state: RootState) => state.promo
  );
  const dispatch = useDispatch();

  const [editMode, setEditMode] = useState(false);

  const maxPromosReached = activated.length >= 3;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isDirty, dirtyFields },
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name,
      email,
      newPassword: "",
      repeatPassword: "",
    },
  });

  const handleSaveAvatar = (croppedImage: string) => {
    setAvatarVisible(false);
    setTimeout(() => {
      dispatch(setAvatar(croppedImage));
      setAvatarVisible(true);
    }, 300);
  };

  const handleLogout = () => {
    logout(dispatch, (url) => window.location.replace(url));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        promoListRef.current &&
        !promoListRef.current.contains(event.target as Node)
      ) {
        setPromoOpen(false);
      }
    };

    if (promoOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [promoOpen]);

  const onSubmit = (data: any) => {
    if (data.newPassword && data.newPassword !== data.repeatPassword) {
      toast.error("Пароли не совпадают");
      return;
    }

    if (dirtyFields.name) {
      dispatch(setName(data.name.trim() || name));
    }
    if (dirtyFields.email) {
      dispatch(setEmail(data.email.trim() || email));
    }
    if (data.newPassword) {
      dispatch(setPassword(data.newPassword || password));
    }

    toast.success("Данные успешно обновлены!");
    setEditMode(false);
    reset({
      name: data.name,
      email: data.email,
      newPassword: "",
      repeatPassword: "",
    });
  };

  if (!isAuth) {
    return <NotFoundPage />;
  }

  return (
    <section className="personal-account">
      <div className="container">
        <h1 className="personal-account__title">Личный кабинет YourMeal</h1>
        <NavButtons customTitle="Личный кабинет" />
        <div className="personal-account__left">
          <Image
            src={avatar || DEFAULT_AVATAR}
            className={`personal-account__avatar ${
              avatarVisible ? "avatar-visible" : "avatar-hidden"
            }`}
            width={330}
            height={330}
            alt="Аватар"
            priority
          />
          <div className="personal-account__actions">
            <button
              className="personal-account__button personal-account__button--edit"
              onClick={() => setShowAvatarUploader(true)}
            >
              {avatar === DEFAULT_AVATAR ? "Добавить" : "Изменить"}
            </button>
            <button
              className="personal-account__button personal-account__button--delete"
              onClick={() => {
                if (avatar !== DEFAULT_AVATAR) {
                  setAvatarVisible(false);

                  setTimeout(() => {
                    dispatch(setAvatar(DEFAULT_AVATAR));
                    setAvatarVisible(true);
                  }, 300);
                }
              }}
              disabled={avatar === DEFAULT_AVATAR}
            >
              Удалить
            </button>
          </div>
          {showAvatarUploader && (
            <AvatarUploader
              onSave={handleSaveAvatar}
              onClose={() => setShowAvatarUploader(false)}
            />
          )}
        </div>

        <div className="personal-account__right">
          <form
            className={
              !editMode
                ? "personal-account__user-info"
                : "personal-account__user-info personal-account__user-info--edit"
            }
            onSubmit={handleSubmit(onSubmit)}
          >
            <div
              className={
                !editMode
                  ? "personal-account__field"
                  : "personal-account__field personal-account__field--edit"
              }
            >
              <label className="personal-account__label">Имя:</label>
              {editMode ? (
                <input
                  type="text"
                  className="personal-account__input personal-account__input--edit"
                  {...register("name", nameValidation)}
                />
              ) : (
                <span className="personal-account__value">{name}</span>
              )}
              {errors.name && <p className="error">{errors.name.message}</p>}
            </div>

            <div
              className={
                !editMode
                  ? "personal-account__field"
                  : "personal-account__field personal-account__field--edit"
              }
            >
              <label className="personal-account__label">Почта:</label>
              {editMode ? (
                <input
                  type="email"
                  className="personal-account__input personal-account__input--edit"
                  {...register("email", emailValidation)}
                />
              ) : (
                <span className="personal-account__value">{email}</span>
              )}
              {errors.email && <p className="error">{errors.email.message}</p>}
            </div>

            <div
              className={
                !editMode
                  ? "personal-account__field"
                  : "personal-account__field personal-account__field--edit"
              }
            >
              <label className="personal-account__label">Пароль:</label>
              {editMode ? (
                <>
                  <input
                    type="password"
                    placeholder="Новый пароль"
                    className="personal-account__input personal-account__input--edit"
                    {...register("newPassword", optionalPasswordValidation)}
                  />
                  <input
                    type="password"
                    placeholder="Повторите пароль"
                    className="personal-account__input personal-account__input--edit"
                    {...register(
                      "repeatPassword",
                      repeatPasswordValidation(() => watch("newPassword"))
                    )}
                  />
                  {errors.newPassword && (
                    <p className="error">{errors.newPassword.message}</p>
                  )}
                  {errors.repeatPassword && (
                    <p className="error">{errors.repeatPassword.message}</p>
                  )}
                </>
              ) : (
                <div className="personal-account__value-container">
                  <span className="personal-account__value">
                    {showPassword ? password : "•".repeat(password.length)}
                  </span>
                  <button
                    type="button"
                    className="personal-account__value-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Image
                      src={showPassword ? showPasswordIcon : hidePasswordIcon}
                      width={20}
                      height={20}
                      alt="toggle-password"
                    />
                  </button>
                </div>
              )}
            </div>

            <div
              className={
                !editMode
                  ? "personal-account__edit-buttons"
                  : "personal-account__edit-buttons personal-account__edit-buttons--edit"
              }
            >
              {editMode && (
                <button
                  type="submit"
                  className="personal-account__button personal-account__button--save"
                  disabled={false}
                >
                  Сохранить
                </button>
              )}

              <button
                type="button"
                className="personal-account__button personal-account__button--edit"
                onClick={() => {
                  if (editMode) {
                    reset({
                      name,
                      email,
                      newPassword: "",
                      repeatPassword: "",
                    });
                  }
                  setEditMode(!editMode);
                }}
              >
                {editMode ? "Отмена" : "Редактировать"}
              </button>
            </div>
          </form>

          {/* Блок с балансом */}
          <div className="personal-account__balance">
            <div className="personal-account__field">
              <label className="personal-account__label">Баланс:</label>
              <span className="personal-account__value">{balance} ₽</span>
            </div>
            <div className="personal-account__balance-controls">
              <button
                onClick={() => alert("Пополнить баланс")}
                className="personal-account__button personal-account__button--primary"
              >
                Пополнить
              </button>
              <button
                onClick={() => alert("Вывести средства")}
                className="personal-account__button personal-account__button--secondary"
              >
                Вывести
              </button>
            </div>
          </div>

          {/* Блок с промокодом */}
          <div className="personal-account__promo">
            <div
              className="personal-account__field"
              style={{ gap: promoError ? "25px 10px" : "15px 10px" }}
            >
              <label className="personal-account__label">Промокод:</label>

              <div className="personal-account__promo-wrapper">
                <input
                  type="text"
                  placeholder="Введите промокод"
                  className="personal-account__input"
                  value={promoInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPromoInput(value);

                    if (value.length > 17) {
                      setPromoError("Слишком длинный промокод.");
                    } else {
                      setPromoError("");
                    }
                  }}
                  disabled={maxPromosReached}
                />
                {promoError && (
                  <p className="personal-account__promo-error">{promoError}</p>
                )}

                <div
                  className="personal-account__promo-select"
                  ref={promoListRef}
                >
                  <button
                    type="button"
                    className="personal-account__promo-toggle"
                    onClick={() => setPromoOpen(!promoOpen)}
                  >
                    <Image
                      src={listPromoCodeIcon}
                      width={34}
                      height={34}
                      alt="list-promo-code-icon"
                    />
                    <p className="personal-account__promo-symbol">%</p>
                  </button>
                  {promoOpen && available.length > 0 && (
                    <ul className="personal-account__promo-list">
                      {[...DEFAULT_PROMOS, ...available]
                        .filter(
                          (code, index, arr) => arr.indexOf(code) === index
                        )
                        .filter((code) => !activated.includes(code))
                        .map((code) => {
                          const isDefault = DEFAULT_PROMOS.includes(code);
                          const title =
                            PROMO_DESCRIPTIONS[code] || "Новый промокод!";
                          return (
                            <li
                              key={code}
                              title={title}
                              className={`personal-account__promo-item${
                                isDefault
                                  ? " personal-account__promo-item--default"
                                  : ""
                              }${maxPromosReached ? " disabled" : ""}`}
                              onClick={() => {
                                if (!maxPromosReached) {
                                  dispatch(activatePromo(code));
                                  setPromoOpen(false);
                                }
                              }}
                            >
                              {code}
                            </li>
                          );
                        })}
                    </ul>
                  )}
                </div>

                <button
                  onClick={() => {
                    const trimmed = promoInput.trim();
                    if (trimmed && trimmed.length <= 17 && !maxPromosReached) {
                      dispatch(activatePromo(trimmed));
                      setPromoInput("");
                      setPromoError("");
                    }
                  }}
                  className="personal-account__button personal-account__button--primary"
                  disabled={
                    !promoInput.trim() ||
                    promoInput.trim().length > 17 ||
                    maxPromosReached
                  }
                >
                  Активировать
                </button>
              </div>

              {activated.length > 0 && (
                <div className="personal-account__promo-active">
                  {activated.map((code) => (
                    <div
                      key={code}
                      title={PROMO_DESCRIPTIONS[code] || "Новый промокод!"}
                      className={`personal-account__promo-tag ${
                        removingPromo === code
                          ? "personal-account__promo-tag--removing"
                          : ""
                      } ${
                        DEFAULT_PROMOS.includes(code)
                          ? "personal-account__promo-tag--default"
                          : ""
                      }`}
                    >
                      {code}
                      <button
                        className="personal-account__promo-remove"
                        onClick={() => {
                          setRemovingPromo(code);
                          setTimeout(() => {
                            dispatch(removePromo(code));
                            setRemovingPromo(null);
                          }, 300);
                        }}
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/*Кнопка выхода*/}
          <button
            className="personal-account__button--logout"
            onClick={handleLogout}
          >
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </section>
  );
}
