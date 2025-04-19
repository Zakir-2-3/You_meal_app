"use client";

import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";

import Image from "next/image";

import dd from "@/assets/images/no-avatar.jpg";

import "./userPage.scss";

export default function UserPage() {
  const [user, setUser] = useState({
    name: "Иван Иванов",
    email: "ivan@example.com",
    password: "********",
    avatar: dd,
    balance: 0,
  });

  const dispatch = useDispatch();
  const { name, email, password, balance } = useSelector(
    (state: RootState) => state.user
  );

  // Состояния для режима редактирования
  const [isEditing, setIsEditing] = useState(false);
  const [tempUser, setTempUser] = useState({ ...user });

  // Обработчик изменения данных
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempUser({ ...tempUser, [name]: value });
  };

  // Сохранение изменений
  const handleSave = () => {
    setUser(tempUser);
    setIsEditing(false);
  };

  // Отмена редактирования
  const handleCancel = () => {
    setTempUser(user);
    setIsEditing(false);
  };

  return (
    <section className="personal-account">
      <div className="container">
        <h1 className="personal-account__title">Личный кабинет YourMeal</h1>
        <div className="personal-account__left">
          <Image
            src={user.avatar}
            className="personal-account__avatar"
            width={300}
            height={300}
            alt="Аватар"
          />
          {isEditing ? (
            <div className="personal-account__avatar-controls">
              {/* <input
                type="text"
                name="avatar"
                value={tempUser.avatar}
                onChange={handleChange}
                className="personal-account__input"
              /> */}
              <button
                onClick={handleSave}
                className="personal-account__button personal-account__button--save"
              >
                Изменить
              </button>
              <button
                onClick={handleCancel}
                className="personal-account__button personal-account__button--cancel"
              >
                Удалить
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="personal-account__button personal-account__button--edit"
            >
              Редактировать
            </button>
          )}
        </div>

        <div className="personal-account__right">
          {/* Блок с информацией о пользователе */}
          <div className="personal-account__user-info">
            <div className="personal-account__field">
              <label className="personal-account__label">Имя:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={tempUser.name}
                  onChange={handleChange}
                  className="personal-account__input"
                />
              ) : (
                <span className="personal-account__value">{name}</span>
              )}
            </div>
            <div className="personal-account__field">
              <label className="personal-account__label">Почта:</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={tempUser.email}
                  onChange={handleChange}
                  className="personal-account__input"
                />
              ) : (
                <span className="personal-account__value">{email}</span>
              )}
            </div>
            <div className="personal-account__field">
              <label className="personal-account__label">Пароль:</label>
              {isEditing ? (
                <input
                  type="password"
                  name="password"
                  value={tempUser.password}
                  onChange={handleChange}
                  className="personal-account__input"
                />
              ) : (
                <span className="personal-account__value">{password}</span>
              )}
            </div>
            {isEditing ? (
              <div className="personal-account__controls">
                <button
                  onClick={handleSave}
                  className="personal-account__button personal-account__button--save"
                >
                  Сохранить
                </button>
                <button
                  onClick={handleCancel}
                  className="personal-account__button personal-account__button--cancel"
                >
                  Отмена
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="personal-account__button personal-account__button--edit"
              >
                Редактировать
              </button>
            )}
          </div>

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
            <div className="personal-account__field">
              <label className="personal-account__label">Промокод:</label>
              <input
                type="text"
                placeholder="Введите промокод"
                className="personal-account__input"
              />
              <button
                onClick={() => alert("Промокод активирован")}
                className="personal-account__button personal-account__button--primary"
              >
                Активировать
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
