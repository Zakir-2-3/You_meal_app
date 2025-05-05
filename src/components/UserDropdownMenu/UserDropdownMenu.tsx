import { RefObject } from "react";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { logout } from "@/utils/logout";

import { DEFAULT_AVATAR } from "@/constants/defaults";

import dropdownMenuUserIcon from "@/assets/icons/dropdown-menu-user-icon.svg";
import dropdownMenuSettingsIcon from "@/assets/icons/dropdown-menu-settings-icon.svg";
import dropdownMenuLogoutIcon from "@/assets/icons/dropdown-menu-logout-icon.svg";

import "./UserDropdownMenu.scss";

interface UserDropdownMenuProps {
  showDropdown: boolean;
  dropdownRef: RefObject<HTMLDivElement | null>;
}

const UserDropdownMenu = ({
  showDropdown,
  dropdownRef,
}: UserDropdownMenuProps) => {
  const { avatar, name, email } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const pathname = usePathname();

  const handleLogout = () => {
    logout(dispatch, (url) => window.location.replace(url));
  };

  return (
    <div
      ref={dropdownRef}
      className={`user-dropdown ${
        showDropdown ? "user-dropdown--visible" : ""
      }`}
      style={{
        opacity: showDropdown ? 1 : 0,
        visibility: showDropdown ? "visible" : "hidden",
      }}
    >
      <div className="user-dropdown__header">
        <Image
          src={avatar || DEFAULT_AVATAR}
          alt="Аватар"
          width={24}
          height={24}
          className="user-dropdown__avatar"
        />
        <div>
          <p className="user-dropdown__name">{name}</p>
          <p className="user-dropdown__email">{email}</p>
        </div>
      </div>
      <Link
        href="/user"
        className="user-dropdown__item"
        style={{
          pointerEvents: pathname === "/user" ? "none" : "auto",
          opacity: pathname === "/user" ? 0.6 : 1,
        }}
      >
        <Image
          src={dropdownMenuUserIcon}
          width={24}
          height={24}
          alt="Профиль"
          className="user-dropdown__icon"
        />
        <span>Профиль</span>
      </Link>
      <Link
        href="/user"
        className="user-dropdown__item"
        style={{
          pointerEvents: pathname === "/user" ? "none" : "auto",
          opacity: pathname === "/user" ? 0.6 : 1,
        }}
      >
        <Image
          src={dropdownMenuSettingsIcon}
          width={24}
          height={24}
          alt="Настройки"
          className="user-dropdown__icon"
        />
        <span>Настройки</span>
      </Link>
      <button
        type="button"
        className="user-dropdown__item user-dropdown__item--logout"
        onClick={handleLogout}
      >
        <Image
          src={dropdownMenuLogoutIcon}
          width={24}
          height={24}
          alt="Выйти"
          className="user-dropdown__icon"
        />
        <span>Выйти</span>
      </button>
    </div>
  );
};

export default UserDropdownMenu;
