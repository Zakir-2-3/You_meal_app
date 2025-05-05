"use client";

import { useEffect, useRef, useState } from "react";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import UserDropdownMenu from "../UserDropdownMenu/UserDropdownMenu";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { activeRegForm } from "@/store/slices/userSlice";

import { validRoutes } from "@/constants/validRoutes";

import headerLogo from "@/assets/images/header-logo.png";
import profileLoginIcon from "@/assets/icons/login-profile-icon.svg";
import profileLogoutIcon from "@/assets/icons/logout-profile-icon.svg";
import cartIcon from "@/assets/icons/cart-icon.svg";

import "./Header.scss";

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false); // Dropdown menu при клике на user
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref для меню
  const profileButtonRef = useRef<HTMLButtonElement>(null); // Ref для кнопки профиля
  const pathname = usePathname();

  const { items } = useSelector((state: RootState) => state.cart);
  const { isAuth } = useSelector((state: RootState) => state.user);
  const isFormOpen = useSelector(
    (state: RootState) => state.user.isRegFormOpen
  );
  const dispatch = useDispatch();

  const totalCount = items.reduce((sum, item) => sum + (item.count ?? 0), 0); // Общее кол-во товаров в корзине

  const handleOpenForm = () => {
    if (!isFormOpen) {
      dispatch(activeRegForm(true)); // Открываем форму
    }
  };

  // Проверяем, нужно ли скрывать header
  const isHidden =
    !validRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    ) ||
    (pathname === "/user" && !isAuth);

  // Закрытие dropdown при клике вне его области
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Закрываем дропдаун меню при переходе на другие стр
  useEffect(() => {
    setShowDropdown(false);
  }, [pathname]);

  // Если isHidden = true, возвращаем null (полностью убираем header из DOM)
  if (isHidden) return null;

  return (
    <header className="header">
      <div className="header-container container">
        <div className="header__logo">
          <Link href="/">
            <Image src={headerLogo} alt="header-logo" width={153} height={35} />
          </Link>
        </div>
        <div className="header__profile">
          {isAuth ? (
            <div className="header__profile-auth">
              <button
                ref={profileButtonRef}
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="header__profile-button"
              >
                <Image
                  src={profileLogoutIcon}
                  alt="profile-icon"
                  width={20}
                  height={20}
                />
              </button>
            </div>
          ) : (
            <button onClick={handleOpenForm}>
              <Image
                src={profileLoginIcon}
                alt="profile-icon"
                width={20}
                height={20}
              />
            </button>
          )}
          <UserDropdownMenu
            showDropdown={showDropdown}
            dropdownRef={dropdownRef}
          />
        </div>
        <div className="header__cart">
          <Link href="/cart">
            <Image src={cartIcon} alt="cart-icon" width={20} height={20} />
            <span className="header__total-items">{totalCount}</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
