import { useFormContext } from "react-hook-form";

type Props = {
  email: string;
  onSubmit: (data: { password: string }) => Promise<void>;
};

export default function SetNewPasswordForm({ email, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useFormContext<{ password: string; repeatPassword: string }>();

  return (
    <form
      className="registration-form__reset"
      onSubmit={handleSubmit(onSubmit)}
    >
      <label className="registration-form__label" htmlFor="reset-password">
        Новый пароль:
      </label>
      <input
        id="reset-password"
        type="password"
        className="registration-form__input"
        placeholder="Введите новый пароль"
        {...register("password", {
          required: "Введите пароль",
          minLength: { value: 6, message: "Минимум 6 символов" },
        })}
      />
      {typeof errors.password?.message === "string" && (
        <p className="registration-form__input--error">
          {errors.password.message}
        </p>
      )}

      <label className="registration-form__label" htmlFor="repeat-password">
        Повторите пароль:
      </label>
      <input
        id="repeat-password"
        type="password"
        className="registration-form__input"
        placeholder="Повторите пароль"
        {...register("repeatPassword", {
          validate: (val) => val === watch("password") || "Пароли не совпадают",
        })}
      />
      {typeof errors.repeatPassword?.message === "string" && (
        <p className="registration-form__input--error">
          {errors.repeatPassword.message}
        </p>
      )}

      <div className="registration-form__buttons-group">
        <button
          type="submit"
          className="registration-form__button registration-form__button--primary"
        >
          Сбросить пароль и войти
        </button>
      </div>
    </form>
  );
}
