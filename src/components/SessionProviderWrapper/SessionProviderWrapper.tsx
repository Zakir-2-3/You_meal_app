"use client";

import { useEffect, useRef } from "react";
import { SessionProvider, useSession } from "next-auth/react";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setItems } from "@/store/slices/cartSlice";
import { setPromoCodes } from "@/store/slices/promoSlice";
import {
  setName,
  setEmail,
  setAvatarUrl,
  setAuthStatus,
  setBalance,
} from "@/store/slices/userSlice";

import { DEFAULT_AVATAR } from "@/constants/defaults";

export function SyncAuthUserWithRedux() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch<AppDispatch>();

  const { items } = useSelector((state: RootState) => state.cart);
  const { activated, available } = useSelector(
    (state: RootState) => state.promo
  );
  const { balance, avatarUrl } = useSelector((state: RootState) => state.user);

  const hasLoadedData = useRef(false);
  const hasSavedData = useRef(false);

  // Загрузка пользовательских данных из Supabase
  useEffect(() => {
    const loadData = async () => {
      if (
        status === "authenticated" &&
        session?.user &&
        !hasLoadedData.current
      ) {
        hasLoadedData.current = true;

        dispatch(setAuthStatus(true));
        dispatch(setName(session.user.name || ""));
        dispatch(setEmail(session.user.email || ""));

        try {
          const res = await fetch("/api/user/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "load",
              userId: session.user.id,
              email: session.user.email,
            }),
          });

          if (!res.ok) throw new Error("Failed to load data");

          const data = await res.json();

          dispatch(
            setAvatarUrl(data.avatar ?? session.user.image ?? DEFAULT_AVATAR)
          );
          dispatch(setItems(data.cart || []));

          if (
            data.promoCodes &&
            typeof data.promoCodes === "object" &&
            Array.isArray(data.promoCodes.activated) &&
            Array.isArray(data.promoCodes.available)
          ) {
            dispatch(setPromoCodes(data.promoCodes));
          } else {
            dispatch(setPromoCodes({ activated: [], available: [] }));
          }

          dispatch(setBalance(data.balance || 0));
          hasSavedData.current = true;
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      }
    };

    loadData();
  }, [status, session, dispatch]);

  // Убираем флаг выхода
  useEffect(() => {
    if (status === "authenticated") {
      localStorage.removeItem("hasLoggedOut");
      fetch("/api/auth/session");
    }
  }, [status]);

  // Сохраняем пользовательские данные в Supabase
  useEffect(() => {
    const saveData = async () => {
      if (
        status === "authenticated" &&
        session?.user &&
        localStorage.getItem("hasLoggedOut") !== "true" &&
        hasSavedData.current
      ) {
        try {
          await fetch("/api/user/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "save",
              userId: session.user.id,
              email: session.user.email,
              cart: items,
              promoCodes: {
                activated,
                available,
              },
              balance,
              avatar: avatarUrl,
            }),
          });
        } catch (error) {
          console.error("Error saving user data:", error);
        }
      }
    };

    saveData();
  }, [items, activated, available, balance, status, session, avatarUrl]);

  return null;
}

export default function SessionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={false}>
      <SyncAuthUserWithRedux />
      {children}
    </SessionProvider>
  );
}
