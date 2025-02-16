"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

import Image from "next/image";
import Link from "next/link";

import "./Header.scss";

import headerLogo from "@/assets/images/header-logo.png";
import profileIcon from "@/assets/icons/profile-icon.svg";
import cartIcon from "@/assets/icons/cart-icon.svg";

const Header = () => {
  const { items } = useSelector((state: RootState) => state.cart);
  const totalCount = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <header className="header">
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
