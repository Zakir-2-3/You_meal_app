import { RefObject } from "react";

export interface UserDropdownMenuProps {
  showDropdown: boolean;
  dropdownRef: RefObject<HTMLDivElement | null>;
}
