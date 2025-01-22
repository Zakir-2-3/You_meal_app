import Image from "next/image";

import "./Header.scss";

import headerLogo from "@/assets/images/header-logo.png";
import profileIcon from "@/assets/icons/profile-icon.svg";
import cartIcon from "@/assets/icons/cart-icon.svg";
import Link from "next/link";

const Header = () => {
  return (
    <header className="header">
      <div className="header__container container">
        <div className="header__logo">
          <Link href="/">
            <Image src={headerLogo} alt="header-logo" />
          </Link>
        </div>
        <div className="header__profile">
          <button>
            <Image src={profileIcon} alt="profile-icon" />
          </button>
        </div>
        <div className="header__cart">
          <Link href="/">
            <Image src={cartIcon} alt="cart-icon" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
