"use client";

import { useEffect, useRef } from "react";
import { SessionProvider, useSession } from "next-auth/react";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState, store } from "@/store/store";

import { setItems } from "@/store/slices/cartSlice";
import { setPromoCodes } from "@/store/slices/promoSlice";
import {
  setEmail,
  setAvatarUrl,
  setAuthStatus,
  setBalance,
  setName,
} from "@/store/slices/userSlice";
import { hydrateMeta } from "@/store/slices/productMetaSlice";

import { DEFAULT_AVATAR } from "@/constants/user/defaults";

export function SyncAuthUserWithRedux() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch<AppDispatch>();

  const { items } = useSelector((state: RootState) => state.cart);
  const { activated, customAvailable } = useSelector(
    (state: RootState) => state.promo,
  );
  const { balance, avatarUrl, name } = useSelector(
    (state: RootState) => state.user,
  );

  // Флаг для однократной загрузки
  const hasSyncedRef = useRef(false);

  // Ref для хранения предыдущих значений (чтобы избежать лишних сохранений)
  const prevDataRef = useRef({
    items,
    activated,
    customAvailable,
    balance,
    avatarUrl,
    name,
  });

  const isGoogleUser = !!session?.user?.image;

  // Загрузка данных при авторизации
  useEffect(() => {
    const loadData = async () => {
      if (
        status !== "authenticated" ||
        !session?.user?.email ||
        hasSyncedRef.current ||
        localStorage.getItem("hasLoggedOut") === "true"
      ) {
        return;
      }

      hasSyncedRef.current = true;

      dispatch(setAuthStatus(true));
      dispatch(setEmail(session.user.email));

      if (isGoogleUser) {
        if (!name && session.user.name) {
          dispatch(setName(session.user.name));
        }
        if (!avatarUrl && session.user.image) {
          dispatch(setAvatarUrl(session.user.image));
        }
      }

      try {
        const res = await fetch("/api/user/load", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        });
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();

        if (data.name) dispatch(setName(data.name));
        dispatch(
          setAvatarUrl(data.avatar || session.user.image || DEFAULT_AVATAR),
        );
        if (Array.isArray(data.cart)) dispatch(setItems(data.cart));
        if (data.promoCodes) {
          dispatch(
            setPromoCodes({
              activated: data.promoCodes.activated || [],
              customAvailable: data.promoCodes.customAvailable || [],
            }),
          );
        }
        dispatch(setBalance(data.balance || 0));

        const metaRes = await fetch("/api/user/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        });
        if (metaRes.ok) {
          const meta = await metaRes.json();
          dispatch(
            hydrateMeta({
              favorites: meta.favorites || [],
              ratings: meta.ratings || {},
            }),
          );
        }
      } catch (err) {
        console.error("Error loading user data:", err);
        hasSyncedRef.current = false;
      }
    };

    loadData();
  }, [status, session]);

  // Сохранение данных при их изменении (с дебаунсом и сравнением)
  useEffect(() => {
    // Функция сравнения массивов (по ссылкам элементов, т.к. они неизменяемы)
    const arraysEqual = (a: any[], b: any[]) =>
      a.length === b.length && a.every((val, idx) => val === b[idx]);

    const prev = prevDataRef.current;
    const current = {
      items,
      activated,
      customAvailable,
      balance,
      avatarUrl,
      name,
    };

    // Проверяем, действительно ли изменились данные
    const hasChanged =
      !arraysEqual(prev.items, current.items) ||
      !arraysEqual(prev.activated, current.activated) ||
      !arraysEqual(prev.customAvailable, current.customAvailable) ||
      prev.balance !== current.balance ||
      prev.avatarUrl !== current.avatarUrl ||
      prev.name !== current.name;

    if (!hasChanged) {
      // Ничего не изменилось – не запускаем сохранение
      return;
    }

    // Обновляем ref актуальными значениями
    prevDataRef.current = current;

    const saveData = async () => {
      if (
        status !== "authenticated" ||
        !session?.user?.email ||
        !hasSyncedRef.current ||
        localStorage.getItem("hasLoggedOut") === "true"
      ) {
        return;
      }

      try {
        const { ratings, favorites } = store.getState().productMeta;

        await fetch("/api/user/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: session.user.email,
            name,
            avatar: avatarUrl,
            cart: items,
            promoCodes: { activated, customAvailable },
            balance,
            ratings,
            favorites,
          }),
        });
      } catch (err) {
        console.error("Error saving user data:", err);
      }
    };

    const timeoutId = setTimeout(saveData, 500);
    return () => clearTimeout(timeoutId);
  }, [items, activated, customAvailable, balance, avatarUrl, name]);

  return null;
}

export default function SessionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider
      refetchInterval={60 * 30} // проверка каждые 30 минут в фоне
      refetchOnWindowFocus={false} // отключаем проверку при переключении вкладок
    >
      <SyncAuthUserWithRedux />
      {children}
    </SessionProvider>
  );
}
