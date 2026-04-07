"use client";

import { signOut as nextAuthSignOut } from "next-auth/react";
import { toast } from "react-toastify";

import { resetCart } from "@/store/slices/cartSlice";
import { resetPromos } from "@/store/slices/promoSlice";
import { resetMeta } from "@/store/slices/productMetaSlice";
import { resetUser, setGeoCity } from "@/store/slices/userSlice";
import { AppDispatch, RootState, store, persistor } from "@/store/store";

import { detectGeoCity } from "@/utils/common/geo";

export const signOut = async (
  dispatch: AppDispatch,
  translations: { signOutError: string; signOutSuccess: string },
  onSuccess?: (redirectUrl: string) => void,
) => {
  const { signOutError, signOutSuccess } = translations;

  sessionStorage.setItem("__sign_out_in_progress", "true");
  sessionStorage.setItem("__block_autosave", "true");

  try {
    const state: RootState = store.getState();
    const { email, name, balance, avatarUrl, geoCity } = state.user;
    const { items: cart } = state.cart;
    const { activated, customAvailable } = state.promo;
    const { ratings, favorites } = state.productMeta;

    if (email) {
      await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          cart,
          balance,
          avatar: avatarUrl,
          promoCodes: {
            activated,
            customAvailable,
          },
          ratings,
          favorites,
          city: geoCity,
        }),
      });
    }

    await persistor.pause();
    await nextAuthSignOut({ redirect: false });

    const currentCity = geoCity || localStorage.getItem("city");

    dispatch(resetCart());
    dispatch(resetPromos());
    dispatch(resetUser());
    dispatch(resetMeta());

    await persistor.flush();
    await persistor.purge();

    if (currentCity) {
      dispatch(setGeoCity(currentCity));
      localStorage.setItem("city", currentCity);
    } else {
      const detectedCity = await detectGeoCity("ru");
      dispatch(setGeoCity(detectedCity || ""));
      localStorage.setItem("city", detectedCity || "");
    }

    toast.success(signOutSuccess);

    if (onSuccess) onSuccess("/");
    else window.location.replace("/");
  } catch (error) {
    console.error("Sign out error:", error);
    toast.error(signOutError);
  } finally {
    sessionStorage.removeItem("__sign_out_in_progress");
    sessionStorage.removeItem("__block_autosave");
  }
};
