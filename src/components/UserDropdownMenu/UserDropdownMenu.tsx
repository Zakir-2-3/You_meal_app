import { RefObject } from "react";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";

import { logout } from "@/utils/logout";

import { useTranslate } from "@/hooks/useTranslate";

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
  setShowDropdown,
}: UserDropdownMenuProps & { setShowDropdown: (val: boolean) => void }) => {
  const { avatarUrl, name, email } = useSelector(
    (state: RootState) => state.user
  );
  const dispatch = useDispatch();
  const pathname = usePathname();

  const { t } = useTranslate();

  const { profile, settings, logOut } = t.headerDropdownMenu;

  const handleLogout = () => {
    // Сначала закрываем дропдаун
    setShowDropdown(false);

    logout(dispatch, () => {
      if (pathname === "/") {
        window.location.reload(); // если уже на главной — перезагрузить
      } else {
        window.location.replace("/"); // иначе перейти на главную
      }
    });
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
          src={avatarUrl || DEFAULT_AVATAR}
          alt="avatar"
          width={24}
          height={24}
          className="user-dropdown__avatar"
        />
        <div className="user-dropdown__info">
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
          alt="user"
          className="user-dropdown__icon"
        />
        <span>{profile}</span>
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
          alt="settings"
          className="user-dropdown__icon"
        />
        <span>{settings}</span>
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
          alt="logout"
          className="user-dropdown__icon"
        />
        <span>{logOut}</span>
      </button>
    </div>
  );
};

export default UserDropdownMenu;
