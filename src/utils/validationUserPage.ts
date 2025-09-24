import { FORM_ERRORS } from "@/constants/formErrors";

export const nameEditValidation = {
  validate: (value: string) => {
    const trimmed = value.trim();

    if (!value) return true;
    if (trimmed.length === 0) return FORM_ERRORS.NAME_INVALID;
    if (trimmed.length < 2) return "Имя должно быть не менее 2 символов";
    if (!/^[A-Za-zА-Яа-яЁё\s-]+$/.test(trimmed))
      return FORM_ERRORS.NAME_INVALID;

    return true;
  },
};

export const optionalPasswordEditValidation = {
  validate: (value: string) => {
    if (!value) return true;

    if (/\s/.test(value)) return "Пароль не должен содержать пробелы";
    if (value.length < 5) return FORM_ERRORS.PASSWORD_MIN_LENGTH;
    if (/^\d/.test(value)) return FORM_ERRORS.PASSWORD_STARTS_WITH_NUMBER;
    if (/[а-яА-ЯЁё]/.test(value)) return FORM_ERRORS.PASSWORD_CYRILLIC;
    if (!/^[A-Za-z0-9]+$/.test(value)) return FORM_ERRORS.PASSWORD_INVALID;

    return true;
  },
};

// Валидация для повторного пароля
export const repeatPasswordEditValidation = (watchFn: () => string) => ({
  validate: (val: string) => {
    const original = watchFn();
    if (original && !val) return "Повторите пароль";
    return val === original || "Пароли не совпадают";
  },
});
