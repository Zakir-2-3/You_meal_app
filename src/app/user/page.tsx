"use client";

import { useState, useRef, useEffect } from "react";

import Image from "next/image";
import { useSession } from "next-auth/react";

import { RootState, store } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { setAvatarUrl, setName } from "@/store/slices/userSlice";
import {
  activatePromo,
  deletePromo,
  removePromo,
} from "@/store/slices/promoSlice";

import { toast } from "react-toastify";
import { useForm } from "react-hook-form";

import { LottieIcon } from "@/components/LottieIcon";
import NavButtons from "@/components/NavButtons/NavButtons";
import AvatarUploader from "@/components/AvatarUploader/AvatarUploader";

import NotFoundPage from "@/app/not-found";

import { logout } from "@/utils/logout";
import { deleteAccount } from "@/utils/deleteAccount";
import { createUserValidationRules } from "@/utils/validationUserPage";

import { supabase } from "@/lib/supabaseClient";

import { useTranslate } from "@/hooks/useTranslate";

import {
  DEFAULT_AVATAR,
  DEFAULT_PROMOS,
  PROMO_DESCRIPTIONS,
} from "@/constants/defaults";

import CloseIcon from "@/ui/icons/CloseIcon";

import saleAnimation from "@/assets/animations/sale_animation.json";
import hidePasswordIcon from "@/assets/icons/hide-password-icon.svg";
import showPasswordIcon from "@/assets/icons/show-password-icon.svg";

import "./userPage.scss";

export default function UserPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showAvatarUploader, setShowAvatarUploader] = useState(false);
  const [avatarVisible, setAvatarVisible] = useState(true);
  const [promoInput, setPromoInput] = useState("");
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [removingPromo, setRemovingPromo] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [nameSameError, setNameSameError] = useState("");
  const [passwordSameError, setPasswordSameError] = useState("");
  const [lastCheckedName, setLastCheckedName] = useState<string | null>(null);
  const [lastCheckedPassword, setLastCheckedPassword] = useState<string | null>(
    null
  );
  const [isChecking, setIsChecking] = useState(false);

  const promoListRef = useRef<HTMLDivElement | null>(null);
  const { data: session } = useSession();

  const { name, email, balance, avatarUrl, isAuth } = useSelector(
    (state: RootState) => state.user
  );
  const { available, activated } = useSelector(
    (state: RootState) => state.promo
  );
  const dispatch = useDispatch();

  const { t, lang } = useTranslate();

  const {
    title,
    titleNav,
    nameLabel,
    emailLabel,
    passwordLabel,
    balanceLabel,
    promoCodeLabel,
    repeatPasswordPlaceholder,
    enterPromoCodePlaceholder,
    promoCodeLong,
  } = t.user;

  const { newPasswordLabel } = t.regForm;

  const {
    logOutAccountTr,
    deleteAccountTr,
    activateTr,
    changeTr,
    deleteTr,
    topUp,
    withdraw,
    cancelTr,
    editTr,
    save,
    uploadAvatar,
  } = t.buttons;

  const {
    avatarDeleted,
    avatarDeleteFailed,
    nameUpdateFailed,
    passwordChangeFailed,
    dataUpdatedSuccess,
    dataValidationError,
    logoutError,
    logoutSuccess,
  } = t.toastTr;

  const userValidationRules = createUserValidationRules(t.formErrors);

  const isGoogleUser = session?.user?.image?.includes("googleusercontent");

  const maxPromosReached = activated.length >= 3;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, isDirty, dirtyFields },
    reset,
    trigger,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name,
      email: email || "",
      newPassword: "",
      repeatPassword: "",
    },
  });

  const availablePromoCodes = [...DEFAULT_PROMOS, ...available]
    .filter((code, index, arr) => arr.indexOf(code) === index)
    .filter((code) => !activated.includes(code));

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "newPassword") {
        trigger("repeatPassword"); // Перезапускаем валидацию repeatPassword
        setPasswordSameError("");
      }
      if (name === "name") {
        setNameSameError(""); // очищаем текст при изменении имени
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, trigger]);

  const handleDeleteAvatar = async () => {
    if (avatarUrl === DEFAULT_AVATAR) return;

    const previousAvatarUrl = avatarUrl;

    // Сначала визуальное обновление
    setAvatarVisible(false);
    setTimeout(() => {
      dispatch(setAvatarUrl(DEFAULT_AVATAR));
      setAvatarVisible(true);
      toast.error(avatarDeleted);
    }, 300);

    try {
      // Удаление файла с сервера
      if (previousAvatarUrl.includes("/avatars/")) {
        const fileName = previousAvatarUrl.split("/avatars/")[1];
        if (fileName) {
          await fetch("/api/avatar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName }),
          });
        }
      }

      // Обновление записи пользователя
      const state = store.getState();
      const { email, balance } = state.user;
      const cart = state.cart.items;
      const promoCodes = state.promo.activated;

      if (email) {
        await fetch("/api/user/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            cart,
            promoCodes,
            balance,
            avatar: DEFAULT_AVATAR,
          }),
        });
      }
    } catch (error) {
      console.error("Ошибка удаления аватарки:", error);
      // В случае ошибки возвращаем предыдущую аватарку
      setAvatarVisible(false);
      setTimeout(() => {
        dispatch(setAvatarUrl(previousAvatarUrl));
        setAvatarVisible(true);
        toast.error(avatarDeleteFailed);
      }, 300);
    }
  };

  const handleSaveAvatar = (newAvatarUrl: string) => {
    // Анимация только при первом сохранении (временный URL)
    if (newAvatarUrl.startsWith("blob:")) {
      setAvatarVisible(false);
      setTimeout(() => {
        dispatch(setAvatarUrl(newAvatarUrl));
        setAvatarVisible(true);
      }, 300);
    } else {
      // Для постоянных URL обновляем без анимации
      dispatch(setAvatarUrl(newAvatarUrl));
    }
  };

  const handleLogout = () => {
    logout(
      dispatch,
      {
        logoutError,
        logoutSuccess,
      },
      (url: string) => window.location.replace(url)
    );
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

  useEffect(() => {
    if (isGoogleUser) setEditMode(false);
  }, [isGoogleUser]);

  const onSubmit = async (data: any) => {
    if (data.newPassword && data.newPassword !== data.repeatPassword) {
      return;
    }

    // Проверка: не те ли данные уже выдавали совпадение
    if (
      nameSameError &&
      lastCheckedName === data.name.trim() &&
      data.name.trim() !== ""
    ) {
      // Имя уже проверено и совпадало — не дергаем сервер
      return;
    }

    if (
      passwordSameError &&
      lastCheckedPassword === data.newPassword &&
      data.newPassword !== ""
    ) {
      // Пароль уже проверен и совпадал — не дергаем сервер
      return;
    }

    setIsChecking(true); // блокируем кнопку

    try {
      const checkRes = await fetch("/api/user/check-updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          newName: data.name.trim(),
          newPassword: data.newPassword || "",
        }),
      });

      if (!checkRes.ok) throw new Error("Ошибка проверки данных");

      const checkData = await checkRes.json();

      const nameSame = checkData.nameSame && data.name.trim() !== "";
      const passwordSame = checkData.passwordSame && data.newPassword !== "";

      setNameSameError(nameSame ? "Имя совпадает с текущим" : "");
      setPasswordSameError(passwordSame ? "Пароль совпадает с текущим" : "");

      setLastCheckedName(data.name.trim());
      setLastCheckedPassword(data.newPassword);

      // Если есть совпадения, то не сохраняем
      if (nameSame || passwordSame) {
        setIsChecking(false); // разблокируем кнопку для новых данных
        return;
      }

      let updated = false;

      if (dirtyFields.name && data.name.trim()) {
        const { error: updateError } = await supabase
          .from("users")
          .update({ name: data.name.trim() })
          .eq("email", email);

        if (updateError) {
          toast.error(nameUpdateFailed);
          console.error(updateError.message);
          return;
        }

        dispatch(setName(data.name.trim()));
        updated = true;
      }

      if (data.newPassword) {
        try {
          const res = await fetch("/api/auth/change-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, newPassword: data.newPassword }),
          });

          if (!res.ok) throw new Error("Ошибка при смене пароля");

          updated = true;
        } catch (err) {
          console.error(err);
          toast.error(passwordChangeFailed);
          return;
        }
      }

      if (updated) {
        toast.success(dataUpdatedSuccess);
        setEditMode(false);
        reset({
          name: "",
          email: data.email,
          newPassword: "",
          repeatPassword: "",
        });
        // очищаем кэш
        setLastCheckedName(null);
        setLastCheckedPassword(null);
      }
    } catch (err) {
      console.error("Ошибка при проверке обновлений:", err);
      toast.error(dataValidationError);
    } finally {
      setIsChecking(false);
    }
  };

  if (!isAuth) {
    return <NotFoundPage />;
  }

  return (
    <section className="personal-account">
      <div className="container">
        <h1 className="personal-account__title">{title}</h1>
        <NavButtons customTitle={titleNav} />

        <div className="personal-account__left">
          <Image
            src={avatarUrl || DEFAULT_AVATAR}
            className={`personal-account__avatar ${
              avatarVisible ? "avatar-visible" : "avatar-hidden"
            }`}
            width={300}
            height={300}
            alt="avatar"
            priority
          />
          <div className="personal-account__actions">
            <button
              className="personal-account__button personal-account__button--edit"
              onClick={() => setShowAvatarUploader(true)}
            >
              {avatarUrl === DEFAULT_AVATAR ? uploadAvatar : changeTr}
            </button>
            <button
              className="personal-account__button personal-account__button--delete"
              onClick={handleDeleteAvatar}
              disabled={avatarUrl === DEFAULT_AVATAR}
            >
              {deleteTr}
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
            className={`personal-account__user-info ${
              editMode ? "personal-account__user-info--edit" : ""
            }`}
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="personal-account__field">
              {editMode ? (
                <>
                  <label
                    className="personal-account__label"
                    htmlFor="user-name"
                  >
                    {nameLabel}
                  </label>
                  <input
                    id="user-name"
                    type="text"
                    placeholder={nameLabel}
                    className="personal-account__input personal-account__input--edit"
                    {...register(
                      "name",
                      userValidationRules.nameEditValidation
                    )}
                  />
                  {errors.name && (
                    <p
                      className={`registration-form__input--error personal-account__name-error ${
                        lang === "en" ? "english-style" : ""
                      }`}
                    >
                      {errors.name.message}
                    </p>
                  )}
                  {nameSameError && (
                    <p className="registration-form__input--error personal-account__name-error">
                      {nameSameError}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <label className="personal-account__label">{nameLabel}</label>
                  <span className="personal-account__value">{name}</span>
                </>
              )}
            </div>

            <div className="personal-account__field">
              {editMode ? (
                <>
                  <label
                    className="personal-account__label"
                    htmlFor="user-email"
                  >
                    {emailLabel}
                  </label>
                  <input
                    id="user-email"
                    type="email"
                    className="personal-account__input personal-account__input--edit"
                    value={email}
                    disabled
                    readOnly
                  />
                  {isGoogleUser && (
                    <p className="personal-account__hint">
                      Недоступно в Google-аккаунте
                    </p>
                  )}
                </>
              ) : (
                <>
                  <label className="personal-account__label">
                    {emailLabel}
                  </label>
                  <span className="personal-account__value">{email}</span>
                </>
              )}
            </div>

            <div className="personal-account__field">
              {editMode ? (
                !isGoogleUser ? (
                  <>
                    <label
                      className="personal-account__label"
                      htmlFor="user-new-password"
                    >
                      {passwordLabel}
                    </label>
                    <div className="personal-account__input-password-wrapper">
                      <input
                        id="user-new-password"
                        type={showPassword ? "text" : "password"}
                        placeholder={newPasswordLabel}
                        className="personal-account__input personal-account__input--edit"
                        {...register(
                          "newPassword",
                          userValidationRules.optionalPasswordEditValidation
                        )}
                      />
                      <button
                        type="button"
                        className="personal-account__value-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <Image
                          src={
                            showPassword ? showPasswordIcon : hidePasswordIcon
                          }
                          width={20}
                          height={20}
                          alt="toggle-password"
                        />
                      </button>

                      <input
                        id="user-repeat-password"
                        type={showPassword ? "text" : "password"}
                        placeholder={repeatPasswordPlaceholder}
                        className="personal-account__input personal-account__input--edit"
                        {...register(
                          "repeatPassword",
                          userValidationRules.repeatPasswordEditValidation(() =>
                            watch("newPassword")
                          )
                        )}
                      />
                    </div>

                    {errors.newPassword && (
                      <p className="registration-form__input--error personal-account__password-error">
                        {errors.newPassword.message}
                      </p>
                    )}
                    {passwordSameError && (
                      <p className="registration-form__input--error personal-account__password-error">
                        {passwordSameError}
                      </p>
                    )}
                    {errors.repeatPassword && (
                      <p className="registration-form__input--error personal-account__repeat-password-error">
                        {errors.repeatPassword.message}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <label
                      className="personal-account__label"
                      htmlFor="user-password"
                    >
                      {passwordLabel}
                    </label>
                    <input
                      id="user-password"
                      type="password"
                      className="personal-account__input personal-account__input--edit"
                      value="••••••••"
                      disabled
                      readOnly
                    />
                    {isGoogleUser && (
                      <p className="personal-account__hint">
                        Недоступно в Google-аккаунте
                      </p>
                    )}
                  </>
                )
              ) : (
                <>
                  <label className="personal-account__label">
                    {passwordLabel}
                  </label>
                  <div className="personal-account__value-container">
                    <span className="personal-account__value">••••••••</span>
                  </div>
                </>
              )}
            </div>

            <div className="personal-account__edit-buttons">
              {editMode && (
                <button
                  type="submit"
                  className="personal-account__button personal-account__button--save"
                  disabled={!isDirty || !isValid || isChecking}
                >
                  {save}
                </button>
              )}
              <button
                type="button"
                className="personal-account__button personal-account__button--edit"
                onClick={() => {
                  if (editMode) {
                    reset({
                      name,
                      email: email || "",
                      newPassword: "",
                      repeatPassword: "",
                    });
                  } else {
                    reset({
                      name: "",
                      email: email || "",
                      newPassword: "",
                      repeatPassword: "",
                    });
                  }
                  setEditMode(!editMode);
                }}
              >
                {editMode ? cancelTr : editTr}
              </button>
            </div>
          </form>

          <div className="personal-account__balance">
            <div className="personal-account__field">
              <label className="personal-account__label">{balanceLabel}</label>
              <span className="personal-account__value">{balance} ₽</span>
            </div>
            <div className="personal-account__balance-controls">
              <button
                onClick={() => alert("Пополнить баланс")}
                className="personal-account__button personal-account__button--primary"
              >
                {topUp}
              </button>
              <button
                onClick={() => alert("Вывести средства")}
                className="personal-account__button personal-account__button--secondary"
              >
                {withdraw}
              </button>
            </div>
          </div>

          {/* Блок с промокодом */}
          <div
            className={`personal-account__promo${
              activated.length > 0 ? " has-promo" : ""
            }`}
          >
            <div
              className="personal-account__field"
              style={{ gap: promoError ? "25px 10px" : "15px 10px" }}
            >
              <label className="personal-account__label">
                {promoCodeLabel}
              </label>

              <div className="personal-account__promo-wrapper">
                <input
                  type="text"
                  placeholder={enterPromoCodePlaceholder}
                  className="personal-account__input"
                  value={promoInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPromoInput(value);

                    if (value.length > 10) {
                      setPromoError(promoCodeLong);
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
                    onClick={() => {
                      if (availablePromoCodes.length > 0) {
                        setPromoOpen((prev) => !prev);
                      }
                    }}
                  >
                    <LottieIcon
                      animationData={saleAnimation}
                      trigger="always"
                      loop
                      size={34}
                    />
                  </button>
                  {promoOpen && availablePromoCodes.length > 0 && (
                    <ul className="personal-account__promo-list">
                      {availablePromoCodes.map((code) => {
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
                                : " personal-account__promo-item--custom"
                            }${maxPromosReached ? " disabled" : ""}`}
                            onClick={() => {
                              if (!maxPromosReached) {
                                dispatch(activatePromo(code));
                                setPromoOpen(false);
                              }
                            }}
                          >
                            <p>{code}</p>
                            {!isDefault && (
                              <button
                                className="personal-account__promo-remove"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (activated.includes(code)) {
                                    dispatch(removePromo(code));
                                  } else {
                                    dispatch(deletePromo(code));
                                  }
                                }}
                              >
                                <CloseIcon width={14} height={16} />
                              </button>
                            )}
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
                      setPromoOpen(false);
                    }
                  }}
                  className="personal-account__button personal-account__button--primary"
                  disabled={
                    !promoInput.trim() ||
                    promoInput.trim().length > 17 ||
                    maxPromosReached
                  }
                >
                  {activateTr}
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
                          : "personal-account__promo-item--custom"
                      }`}
                    >
                      <p>{code}</p>
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
                        <CloseIcon width={14} height={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="personal-account__actions-bottom">
            <button
              className="personal-account__button--logout"
              onClick={handleLogout}
            >
              {logOutAccountTr}
            </button>

            <button
              className="personal-account__button--logout personal-account__button--danger"
              onClick={() => deleteAccount(dispatch, email, avatarUrl)}
            >
              {deleteAccountTr}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
