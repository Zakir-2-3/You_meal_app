"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";

import { useTranslate } from "@/hooks/app/useTranslate";
import { useUserAvatar } from "@/hooks/user/avatar/useUserAvatar";
import { useProfileForm } from "@/hooks/user/profile/useProfileForm";

import { signOut } from "@/utils/auth/signOut";
import { deleteAccount } from "@/utils/auth/deleteAccount";
import { createUserValidationRules } from "@/utils/user/validationUserPage";

import NotFoundPage from "@/app/not-found";
import ProfileForm from "@/components/user/profile/ProfileForm";
import PromoSection from "@/components/user/promo/PromoSection";
import NavButtons from "@/components/layout/NavButtons/NavButtons";
import ActionButtons from "@/components/user/actions/ActionButtons";
import BalanceSection from "@/components/user/balance/BalanceSection";
import AvatarSection from "@/components/user/avatar/AvatarSection/AvatarSection";

import "./page.scss";

export default function UserPage() {
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAvatarUploader, setShowAvatarUploader] = useState(false);

  const { data: session } = useSession();
  const isGoogleUser = session?.user?.image?.includes("googleusercontent");

  const dispatch = useDispatch<AppDispatch>();
  const { name, email, balance, avatarUrl, isAuth } = useSelector(
    (state: RootState) => state.user,
  );
  const currency = useSelector((state: RootState) => state.currency.currency);

  const { t, lang } = useTranslate();

  const {
    title,
    nameLabel,
    emailLabel,
    passwordLabel,
    balanceLabel,
    promoCodeLabel,
    repeatPasswordPlaceholder,
    enterPromoCodePlaceholder,
    promoCodeMax,
    promoCodeMin,
    namePlaceholder,
    maxActivatedMessage,
  } = t.user;

  const { newPasswordUserLabel } = t.user;

  const {
    signOutAccountTr,
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
    topUpAlert,
    withdrawFundsAlert,
  } = t.buttons;

  const {
    avatarDeleted,
    avatarDeleteFailed,
    nameUpdateFailed,
    passwordChangeFailed,
    dataUpdatedSuccess,
    dataValidationError,
    signOutError,
    signOutSuccess,
    accountDeleteFailed,
    accountDeleted,
    accountDeleteError,
  } = t.toastTr;

  const { deleteAccountAlert } = t.buttons;

  const userValidationRules = createUserValidationRules(t.formErrors);

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

  const {
    nameSameError,
    passwordSameError,
    lastCheckedName,
    lastCheckedPassword,
    isChecking,
    handleProfileSubmit,
  } = useProfileForm({
    email,
    name,
    dispatch,
    watch,
    trigger,
    reset,
    translations: {
      nameUpdateFailed,
      passwordChangeFailed,
      dataUpdatedSuccess,
      dataValidationError,
    },
  });

  const { shouldAnimateAvatar, handleDeleteAvatar } = useUserAvatar({
    email,
    avatarUrl,
    dispatch,
    translations: {
      avatarDeleted,
      avatarDeleteFailed,
    },
  });

  const handleSignOut = () => {
    signOut(
      dispatch,
      {
        signOutError,
        signOutSuccess,
      },
      (url: string) => window.location.replace(url),
    );
  };

  const handleDeleteAccount = async () => {
    if (!email) return;

    await deleteAccount(dispatch, email, {
      accountDeleteFailed,
      accountDeleted,
      accountDeleteError,
      deleteAccountAlert,
    });
  };

  // Отключаем режим редактирования для Google-пользователей
  useEffect(() => {
    if (isGoogleUser) setEditMode(false);
  }, [isGoogleUser]);

  if (!isAuth) {
    return <NotFoundPage />;
  }

  return (
    <section className="personal-account">
      <div className="container">
        <h1 className="personal-account__title">{title}</h1>
        <NavButtons />

        <AvatarSection
          avatarUrl={avatarUrl}
          shouldAnimateAvatar={shouldAnimateAvatar}
          showAvatarUploader={showAvatarUploader}
          onShowUploader={() => setShowAvatarUploader(true)}
          onDeleteAvatar={handleDeleteAvatar}
          onCloseUploader={() => setShowAvatarUploader(false)}
          translations={{
            uploadAvatar,
            changeTr,
            deleteTr,
          }}
        />

        <div className="personal-account__right">
          <ProfileForm
            name={name}
            email={email || ""}
            isGoogleUser={!!isGoogleUser}
            isAuth={isAuth}
            lang={lang}
            editMode={editMode}
            showPassword={showPassword}
            nameSameError={nameSameError}
            passwordSameError={passwordSameError}
            isChecking={isChecking}
            lastCheckedName={lastCheckedName}
            lastCheckedPassword={lastCheckedPassword}
            onSubmit={(data) => handleProfileSubmit(data, dirtyFields)}
            onToggleEditMode={() => {
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
            onToggleShowPassword={() => setShowPassword(!showPassword)}
            onResetForm={() => {
              reset({
                name,
                email: email || "",
                newPassword: "",
                repeatPassword: "",
              });
            }}
            validationRules={userValidationRules}
            register={register}
            handleSubmit={handleSubmit}
            errors={errors}
            watch={watch}
            trigger={trigger}
            isValid={isValid}
            isDirty={isDirty}
            dirtyFields={dirtyFields}
            translations={{
              nameLabel,
              emailLabel,
              passwordLabel,
              newPasswordUserLabel: newPasswordUserLabel || "",
              repeatPasswordPlaceholder,
              namePlaceholder,
              save,
              editTr,
              cancelTr,
              passwordUnavailableHint: isGoogleUser
                ? t.user.passwordUnavailableHint
                : "",
            }}
          />

          <BalanceSection
            balance={balance}
            currency={currency}
            onTopUp={() => alert(topUpAlert)}
            onWithdraw={() => alert(withdrawFundsAlert)}
            translations={{
              balanceLabel,
              topUp,
              withdraw,
            }}
          />

          <PromoSection
            translations={{
              promoCodeLabel,
              enterPromoCodePlaceholder,
              promoCodeMax,
              promoCodeMin,
              activateTr,
              maxActivatedMessage,
            }}
          />

          <ActionButtons
            onSignOut={handleSignOut}
            onDeleteAccount={handleDeleteAccount}
            translations={{
              signOutAccountTr,
              deleteAccountTr,
            }}
          />
        </div>
      </div>
    </section>
  );
}
