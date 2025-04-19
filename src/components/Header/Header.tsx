"use client";

import { FC, useEffect, useRef } from "react";

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

const Header: FC = () => {
  const isMounted = useRef(false); // Не сохранять данные в localStorage при первом рендере

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

  useEffect(() => {
    // Создать localStorage если isMounted true
    if (isMounted.current) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
    isMounted.current = true; // isMounted true после первого рендера
  }, [items]);

  // Проверяем, есть ли текущий путь в validRoutes или начинается ли он с динамического пути
  const isHidden = !validRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  return (
    <header className={`header ${isHidden ? "header-hidden" : ""}`}>
      <div className="header-container container">
        <div className="header__logo">
          <Link href="/">
            <Image src={headerLogo} alt="header-logo" width={153} height={35} />
          </Link>
        </div>
        <div className="header__profile">
          {isAuth ? (
            <Link
              href="/user"
              style={{
                pointerEvents: pathname === "/user" ? "none" : "auto",
                opacity: pathname === "/user" ? 0.7 : 1,
              }}
            >
              <Image
                src={profileLogoutIcon}
                alt="profile-icon"
                width={20}
                height={20}
              />
            </Link>
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
          <UserDropdownMenu />
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
