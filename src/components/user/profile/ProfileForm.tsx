"use client";

import PasswordField from "./PasswordField";

import { ProfileFormProps } from "@/types/user/form";

const ProfileForm = ({
  name,
  email,
  isGoogleUser,
  editMode,
  showPassword,
  nameSameError,
  passwordSameError,
  isChecking,
  onSubmit,
  onToggleEditMode,
  onToggleShowPassword,
  onResetForm,
  validationRules,
  register,
  errors,
  watch,
  lang,
  isValid,
  handleSubmit,
  isDirty,
  translations,
}: ProfileFormProps) => {
  return (
    <form
      className={`personal-account__user-info ${
        editMode ? "personal-account__user-info--edit" : ""
      }`}
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Поле имени */}
      <div className="personal-account__field">
        {editMode ? (
          <>
            <label className="personal-account__label" htmlFor="user-name">
              {translations.nameLabel}
            </label>
            <input
              id="user-name"
              type="text"
              placeholder={translations.namePlaceholder}
              className="personal-account__input personal-account__input--edit"
              {...register("name", validationRules.nameEditValidation)}
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
            <label className="personal-account__label">
              {translations.nameLabel}
            </label>
            <span className="personal-account__value">{name}</span>
          </>
        )}
      </div>

      {/* Поле email */}
      <div className="personal-account__field">
        {editMode ? (
          <>
            <label className="personal-account__label" htmlFor="user-email">
              {translations.emailLabel}
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
                {translations.passwordUnavailableHint}
              </p>
            )}
          </>
        ) : (
          <>
            <label className="personal-account__label">
              {translations.emailLabel}
            </label>
            <span className="personal-account__value">{email}</span>
          </>
        )}
      </div>

      {/* Поле пароля */}
      <PasswordField
        editMode={editMode}
        isGoogleUser={isGoogleUser}
        showPassword={showPassword}
        register={register}
        errors={errors}
        validationRules={validationRules}
        watch={watch}
        passwordSameError={passwordSameError}
        onToggleShowPassword={onToggleShowPassword}
        translations={{
          passwordLabel: translations.passwordLabel,
          newPasswordUserLabel: translations.newPasswordUserLabel,
          repeatPasswordPlaceholder: translations.repeatPasswordPlaceholder,
          passwordUnavailableHint: translations.passwordUnavailableHint,
        }}
      />

      {/* Кнопки редактирования/сохранения */}
      <div className="personal-account__edit-buttons">
        {editMode && (
          <button
            type="submit"
            className="personal-account__button personal-account__button--save"
            disabled={!isDirty || !isValid || isChecking}
          >
            {translations.save}
          </button>
        )}
        <button
          type="button"
          className="personal-account__button personal-account__button--edit"
          onClick={() => {
            if (editMode) {
              onResetForm();
            }
            onToggleEditMode();
          }}
        >
          {editMode ? translations.cancelTr : translations.editTr}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
