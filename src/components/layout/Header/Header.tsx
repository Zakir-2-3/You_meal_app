"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { activeRegForm } from "@/store/slices/userSlice";

import LanguageToggle from "../../ui/LanguageToggle/LanguageToggle";
import CurrencySwitcher from "../../ui/CurrencySwitcher/CurrencySwitcher";
import UserDropdownMenu from "../../user/dropdown/UserDropdownMenu/UserDropdownMenu";
import GeoLocationSelector from "../../user/geo/GeoLocationSelector/GeoLocationSelector";

import { validRoutes } from "@/constants/user/validRoutes";

import cartIcon from "@/assets/icons/cart-icon.svg?url";
import headerLogo from "@/assets/images/header-logo.svg";
import profileSignInIcon from "@/assets/icons/sign-in-profile-icon.svg?url";
import profileSignOutIcon from "@/assets/icons/sign-out-profile-icon.svg?url";

import "./Header.scss";

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  const pathname = usePathname();
  const { status: sessionStatus } = useSession();

  const { items } = useSelector((state: RootState) => state.cart);
  const { isAuth } = useSelector((state: RootState) => state.user);
  const isFormOpen = useSelector(
    (state: RootState) => state.user.isRegFormOpen,
  );
  const isUserDataLoaded = useSelector(
    (state: RootState) => state.user.isUserDataLoaded,
  );

  const dispatch = useDispatch<AppDispatch>();

  // Общее кол-во товаров в корзине
  const totalCount = isUserDataLoaded
    ? items.reduce((sum, item) => sum + (item.count ?? 0), 0)
    : 0;

  // Сбрасываем блокировку, когда путь изменился (навигация завершена)
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  // Дополнительный сброс через 2 секунды, если навигация зависла
  useEffect(() => {
    if (isNavigating) {
      const timer = setTimeout(() => setIsNavigating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isNavigating]);

  const handleOpenForm = () => {
    if (!isFormOpen) {
      dispatch(activeRegForm(true));
    }
  };

  // Проверяем, нужно ли скрывать header
  const isHidden =
    !validRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
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

  // Закрываем дропдаун меню при переходе на другие страницы
  useEffect(() => {
    setShowDropdown(false);
  }, [pathname]);

  // Если isHidden = true, возвращаем null (полностью убираем header из DOM)
  if (isHidden) return null;

  const handleCartClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Если уже на странице корзины или идёт переход — отменяем
    if (pathname === "/cart" || isNavigating) {
      e.preventDefault();
      return;
    }
    setIsNavigating(true);
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Уже на главной – отменяем переход
    if (pathname === "/") {
      e.preventDefault();
      return;
    }
    // Идёт навигация – блокируем повторные клики
    if (isNavigating) {
      e.preventDefault();
      return;
    }
    setIsNavigating(true);
  };

  return (
    <header className="header">
      <div className="header-container container">
        <div className="header__logo">
          <Link href="/" onClick={handleLogoClick}>
            <img src={headerLogo} alt="header-logo" width={153} height={35} />
          </Link>
        </div>
        <div className="header__geo">
          <GeoLocationSelector />
        </div>
        <div className="header__language">
          <LanguageToggle />
        </div>
        <div className="header__currency">
          <CurrencySwitcher />
        </div>
        <div className="header__profile">
          {(sessionStatus === "authenticated" || isAuth) && isUserDataLoaded ? (
            <div className="header__profile-auth">
              <button
                ref={profileButtonRef}
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="header__profile-button"
              >
                <img
                  src={profileSignOutIcon}
                  alt="profile-icon"
                  width={20}
                  height={20}
                />
              </button>
            </div>
          ) : (
            <button className="header__profile-button" onClick={handleOpenForm}>
              <img
                src={profileSignInIcon}
                alt="profile-icon"
                width={20}
                height={20}
              />
            </button>
          )}
          <UserDropdownMenu
            showDropdown={showDropdown}
            setShowDropdown={setShowDropdown}
            dropdownRef={dropdownRef}
          />
        </div>
        <div className="header__cart">
          <Link
            href="/cart"
            onClick={handleCartClick}
            style={{
              pointerEvents:
                pathname === "/cart" || isNavigating ? "none" : "auto",
            }}
          >
            <img
              src={cartIcon}
              alt="cart-icon"
              width={20}
              height={20}
              style={{
                opacity: pathname === "/cart" || isNavigating ? 0.6 : 1,
              }}
            />
            <span className="header__total-items">{totalCount}</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
