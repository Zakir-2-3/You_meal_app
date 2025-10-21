"use client";

import { useEffect, useState } from "react";

import { useSession } from "next-auth/react";

import { useDispatch } from "react-redux";
import { RootState, store } from "@/store/store";
import { setItems } from "@/store/slices/cartSlice";
import { setPromoCodes } from "@/store/slices/promoSlice";
import { setBalance, setGeoCity, setAvatarUrl } from "@/store/slices/userSlice";

import { DEFAULT_AVATAR } from "@/constants/defaults";

export const useGoogleSync = () => {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const [googleSyncDone, setGoogleSyncDone] = useState(false);

  useEffect(() => {
    const syncData = async () => {
      if (!session?.user?.email) return;

      const email = session.user.email;
      const localCart = (store.getState() as RootState).cart.items;
      const localCity =
        (store.getState() as RootState).user.geoCity ||
        localStorage.getItem("city");

      try {
        const res = await fetch("/api/user/load", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (!res.ok) return;
        const data = await res.json();

        // Город
        if (!data.city && localCity) {
          await fetch("/api/user/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, city: localCity }),
          });
          dispatch(setGeoCity(localCity));
          localStorage.setItem("city", localCity);
        } else {
          dispatch(setGeoCity(data.city || ""));
        }

        // Корзина
        if ((!data.cart || data.cart.length === 0) && localCart.length > 0) {
          await fetch("/api/user/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, cart: localCart }),
          });
          dispatch(setItems(localCart));
        } else if (
          data.cart &&
          JSON.stringify(data.cart) !== JSON.stringify(localCart)
        ) {
          dispatch(setItems(data.cart));
        }

        dispatch(setPromoCodes(data.promoCodes || []));
        dispatch(setBalance(data.balance || 0));
        dispatch(setAvatarUrl(data.avatar || DEFAULT_AVATAR));

        setGoogleSyncDone(true);
      } catch (err) {
        console.error("Ошибка синхронизации Google-аккаунта:", err);
      }
    };

    syncData();
  }, [session?.user?.email, dispatch]);

  return { googleSyncDone };
};
