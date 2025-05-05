import { FORM_ERRORS } from "@/constants/formErrors";

export const nameValidation = {
  required: FORM_ERRORS.NAME_REQUIRED,
  pattern: {
    value: /^[A-Za-zА-Яа-яЁё]+$/,
    message: FORM_ERRORS.NAME_INVALID,
  },
};

export const emailValidation = {
  required: FORM_ERRORS.EMAIL_REQUIRED,
  validate: (value: string) => {
    const email = String(value).trim();

    if (!email) return FORM_ERRORS.EMAIL_REQUIRED;
    if (/^\d/.test(email)) return FORM_ERRORS.EMAIL_STARTS_WITH_NUMBER;
    if (/[а-яА-ЯЁё]/.test(email)) return FORM_ERRORS.EMAIL_CYRILLIC;
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,4}$/i.test(email))
      return FORM_ERRORS.EMAIL_INVALID;

    return true;
  },
};

export const passwordValidation = {
  required: FORM_ERRORS.PASSWORD_REQUIRED,
  minLength: {
    value: 5,
    message: FORM_ERRORS.PASSWORD_MIN_LENGTH,
  },
  validate: (value: string) => {
    const password = String(value).trim();
    if (!password) return FORM_ERRORS.PASSWORD_REQUIRED;
    if (/^\d/.test(password)) return FORM_ERRORS.PASSWORD_STARTS_WITH_NUMBER;
    if (/[а-яА-ЯЁё]/.test(password)) return FORM_ERRORS.PASSWORD_CYRILLIC;
    if (!/^[A-Za-z0-9]+$/.test(password)) return FORM_ERRORS.PASSWORD_INVALID;
    return true;
  },
};

export const optionalPasswordValidation = {
  validate: (value: string) => {
    if (!value) return true; // если пусто — валидно
    const password = String(value).trim();
    if (password.length < 5) return FORM_ERRORS.PASSWORD_MIN_LENGTH;
    if (/^\d/.test(password)) return FORM_ERRORS.PASSWORD_STARTS_WITH_NUMBER;
    if (/[а-яА-ЯЁё]/.test(password)) return FORM_ERRORS.PASSWORD_CYRILLIC;
    if (!/^[A-Za-z0-9]+$/.test(password)) return FORM_ERRORS.PASSWORD_INVALID;
    return true;
  },
};

export const repeatPasswordValidation = (watchFn: () => string) => ({
  validate: (val: string) => {
    const newPassword = watchFn();
    if (!newPassword && !val) return true; // оба пустые — валидно
    if (val !== newPassword) return "Пароли не совпадают";
    return true;
  },
});
