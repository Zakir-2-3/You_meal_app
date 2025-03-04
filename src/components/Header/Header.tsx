"use client";

import { FC, useEffect, useRef } from "react";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

import { validRoutes } from "@/constants/validRoutes";

import headerLogo from "@/assets/images/header-logo.png";
import profileIcon from "@/assets/icons/profile-icon.svg";
import cartIcon from "@/assets/icons/cart-icon.svg";

import "./Header.scss";

const Header: FC = () => {
  const { items } = useSelector((state: RootState) => state.cart);
  const totalCount = items.reduce((sum, item) => sum + (item.count ?? 0), 0); // Общее кол-во товаров в корзине
  const isMounted = useRef(false); // Не сохранять данные в localStorage при первом рендере
  const pathname = usePathname();

  // Если путь не найден в validRoutes, скрываем Header
  const isHidden = !validRoutes.includes(pathname);

  useEffect(() => {
    // Создать localStorage если isMounted true
    if (isMounted.current) {
      const json = JSON.stringify(items);
      localStorage.setItem("cart", json);
    }
    isMounted.current = true; // isMounted true после первого рендера
  }, [items]);

  return (
    <header className={`header ${isHidden ? "header-hidden" : ""}`}>
      <div className="header-container container">
        <div className="header__logo">
          <Link href="/">
            <Image src={headerLogo} alt="header-logo" width={153} height={35} />
          </Link>
        </div>
        <div className="header__profile">
          <button>
            <Image
              src={profileIcon}
              alt="profile-icon"
              width={20}
              height={20}
            />
          </button>
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
