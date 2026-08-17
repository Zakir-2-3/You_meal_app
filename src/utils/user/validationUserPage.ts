export const createUserValidationRules = (formErrors: any) => {
  return {
    nameEditValidation: {
      minLength: {
        value: 2,
        message: formErrors.NAME_TOO_MIN,
      },
      maxLength: {
        value: 15,
        message: formErrors.NAME_TOO_LONG,
      },
      pattern: {
        value: /^[A-Za-zА-Яа-яЁё]+$/,
        message: formErrors.NAME_INVALID,
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
