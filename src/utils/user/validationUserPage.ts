export const createUserValidationRules = (formErrors: any) => {
  return {
    nameEditValidation: {
      validate: (value: string) => {
        const trimmed = value.trim();

        if (!value) return true;
        if (trimmed.length === 0) return formErrors.NAME_INVALID;
        if (trimmed.length < 2) return formErrors.MIN_2_CHARS;
        if (!/^[A-Za-zА-Яа-яЁё\s-]+$/.test(trimmed))
          return formErrors.NAME_INVALID;

        return true;
      },
    },

    optionalPasswordEditValidation: {
      validate: (value: string) => {
        if (!value) return true;

        if (/\s/.test(value)) return formErrors.NO_SPACES;
        if (value.length < 5) return formErrors.PASSWORD_MIN_LENGTH;
        if (/^\d/.test(value)) return formErrors.PASSWORD_STARTS_WITH_NUMBER;
        if (/[а-яА-ЯЁё]/.test(value)) return formErrors.PASSWORD_CYRILLIC;
        if (!/^[A-Za-z0-9]+$/.test(value)) return formErrors.PASSWORD_INVALID;

        return true;
      },
    },

    repeatPasswordEditValidation: (watchFn: () => string) => ({
      validate: (val: string) => {
        const original = watchFn();
        if (original && !val) return formErrors.REPEAT_PASSWORD;
        return val === original || formErrors.PASSWORDS_NOT_MATCH;
      },
    }),
  };
};
