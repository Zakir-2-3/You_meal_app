import { persistor } from "@/store/store";
import { logoutUser } from "@/store/slices/userSlice";
import { clearItems } from "@/store/slices/cartSlice";
import { resetPromos } from "@/store/slices/promoSlice";

import { toast } from "react-toastify";

export const logout = async (
  dispatch: any,
  redirectTo: (url: string) => void
) => {
  dispatch(logoutUser());
  dispatch(clearItems());
  dispatch(resetPromos());

  await persistor.purge();

  localStorage.clear();
  sessionStorage.clear();

  toast("Вы вышли из аккаунта", {
    type: "error",
    autoClose: 2500,
  });

  redirectTo("/");
};
