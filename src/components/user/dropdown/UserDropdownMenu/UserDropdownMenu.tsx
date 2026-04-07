import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";

import { signOut } from "@/utils/auth/signOut";

import { useTranslate } from "@/hooks/app/useTranslate";

import { DEFAULT_AVATAR } from "@/constants/user/defaults";

import { UserDropdownMenuProps } from "@/types/components/user/user-dropdown-menu";

import dropdownMenuUserIcon from "@/assets/icons/dropdown-menu-user-icon.svg";
import dropdownMenuSettingsIcon from "@/assets/icons/dropdown-menu-settings-icon.svg";
import dropdownMenuSignOutIcon from "@/assets/icons/dropdown-menu-sign-out-icon.svg";

import "./UserDropdownMenu.scss";

const UserDropdownMenu = ({
  showDropdown,
  dropdownRef,
  setShowDropdown,
}: UserDropdownMenuProps & { setShowDropdown: (val: boolean) => void }) => {
  const { avatarUrl, name, email } = useSelector(
    (state: RootState) => state.user,
  );
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();

  const { t } = useTranslate();

  const { profile, settings, signOutTr } = t.headerDropdownMenu;

  const handleSangOut = () => {
    // Сначала закрываем дропдаун
    setShowDropdown(false);

    // Передаем переводы в функцию Sign-out
    signOut(dispatch, t.toastTr, () => {
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
        <img
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
          className="user-dropdown__icon"
          width={24}
          height={24}
          alt="user-icon"
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
          className="user-dropdown__icon"
          alt="settings-icon"
        />
        <span>{settings}</span>
      </Link>
      <button
        type="button"
        className="user-dropdown__item user-dropdown__item--sign-out"
        onClick={handleSangOut}
      >
        <Image
          src={dropdownMenuSignOutIcon}
          className="user-dropdown__icon"
          width={24}
          height={24}
          alt="sign-out-icon"
        />
        <span>{signOutTr}</span>
      </button>
    </div>
  );
};

export default UserDropdownMenu;
