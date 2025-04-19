import Image from "next/image";

import dropdownMenuUserIcon from "@/assets/icons/dropdown-menu-user-icon.svg";
import dropdownMenuSettingsIcon from "@/assets/icons/dropdown-menu-settings-icon.svg";
import dropdownMenuLogoutIcon from "@/assets/icons/dropdown-menu-logout-icon.svg";

import "./UserDropdownMenu.scss";

const UserDropdownMenu = () => {
  return (
    <div className="user-menu">
      <div className="dropdown-menu">
        <div className="menu-header">
          <Image
            src={dropdownMenuUserIcon}
            alt="User"
            className="header-avatar"
          />
          <div>
            <p className="username">John Doe</p>
            <p className="user-email">john@example.com</p>
          </div>
        </div>
        <div className="menu-item">
          <Image
            src={dropdownMenuUserIcon}
            width={24}
            height={24}
            alt="Профиль"
          />
          <span>Профиль</span>
        </div>
        <div className="menu-item">
          <Image
            src={dropdownMenuSettingsIcon}
            width={24}
            height={24}
            alt="Настройки"
          />
          <span>Настройки</span>
        </div>
        <div className="menu-item logout">
          <Image
            src={dropdownMenuLogoutIcon}
            width={24}
            height={24}
            alt="Выйти"
          />
          <span>Выйти</span>
        </div>
      </div>
    </div>
  );
};

export default UserDropdownMenu;
