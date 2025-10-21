export const createValidationRules = (formErrors: any) => {
  return {
    nameValidation: {
      required: formErrors.NAME_REQUIRED,
      pattern: {
        value: /^[A-Za-zА-Яа-яЁё]+$/,
        message: formErrors.NAME_INVALID,
      },
    },

    emailValidation: {
      required: formErrors.EMAIL_REQUIRED,
      validate: (value: string) => {
        const email = String(value).trim();

        if (!email) return formErrors.EMAIL_REQUIRED;
        if (/^\d/.test(email)) return formErrors.EMAIL_STARTS_WITH_NUMBER;
        if (/[а-яА-ЯЁё]/.test(email)) return formErrors.EMAIL_CYRILLIC;
        if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,4}$/i.test(email))
          return formErrors.EMAIL_INVALID;

        return true;
      },
    },

    passwordValidation: {
      required: formErrors.PASSWORD_REQUIRED,
      minLength: {
        value: 5,
        message: formErrors.PASSWORD_MIN_LENGTH,
      },
      validate: (value: string) => {
        const password = String(value).trim();
        if (!password) return formErrors.PASSWORD_REQUIRED;
        if (/^\d/.test(password)) return formErrors.PASSWORD_STARTS_WITH_NUMBER;
        if (/[а-яА-ЯЁё]/.test(password)) return formErrors.PASSWORD_CYRILLIC;
        if (!/^[A-Za-z0-9]+$/.test(password))
          return formErrors.PASSWORD_INVALID;
        return true;
      },
    },

    optionalPasswordValidation: {
      validate: (value: string) => {
        if (!value) return true;
        const password = String(value).trim();
        if (password.length < 5) return formErrors.PASSWORD_MIN_LENGTH;
        if (/^\d/.test(password)) return formErrors.PASSWORD_STARTS_WITH_NUMBER;
        if (/[а-яА-ЯЁё]/.test(password)) return formErrors.PASSWORD_CYRILLIC;
        if (!/^[A-Za-z0-9]+$/.test(password))
          return formErrors.PASSWORD_INVALID;
        return true;
      },
    },

    repeatPasswordValidation: (watchFn: () => string) => ({
      validate: (val: string) => {
        const newPassword = watchFn();
        if (!val) return true;
        return val === newPassword || formErrors.PASSWORDS_NOT_MATCH;
      },
    }),
  };
};
