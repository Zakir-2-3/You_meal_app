"use client";

import { useEffect, useRef } from "react";

import { toast } from "react-toastify";

import { SessionProvider, useSession } from "next-auth/react";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState, store } from "@/store/store";
import { hydrateMeta, setMetaSynced } from "@/store/slices/productMetaSlice";
import { setPromoCodes } from "@/store/slices/promoSlice";
import { setItems } from "@/store/slices/cartSlice";
import {
  setEmail,
  setAvatarUrl,
  setAuthStatus,
  setBalance,
  setName,
  setUserDataLoaded,
  setGoogleSignIn,
} from "@/store/slices/userSlice";

import { useTranslate } from "@/hooks/app/useTranslate";

import { DEFAULT_AVATAR } from "@/constants/user/defaults";
import { GEO_STATUS } from "@/constants/user/geoStatus";

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

  const { t } = useTranslate();

  // Флаг для однократной загрузки
  const hasSyncedRef = useRef(false);

  // Ref для хранения предыдущих значений
  const prevDataRef = useRef({
    items,
    activated,
    customAvailable,
    balance,
    avatarUrl,
    name,
  });

  // Храним локальную корзину до очистки
  const localCartRef = useRef(items);

  const isGoogleUser = !!session?.user?.image;

  // Сброс флага при выходе, чтобы при следующем входе данные загрузились заново
  useEffect(() => {
    if (status === "unauthenticated") {
      hasSyncedRef.current = false;
      dispatch(setUserDataLoaded(true));
      sessionStorage.removeItem("preLoginCartCount");
    }
  }, [status, dispatch]);

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

      // Сохраняем количество товаров до входа для адаптивных скелетонов
      sessionStorage.setItem(
        "preLoginCartCount",
        String(localCartRef.current.length),
      );

      // 1. Сохраняем локальную корзину и очищаем Redux
      localCartRef.current = store.getState().cart.items;

      // 2. Включаем флаг загрузки
      dispatch(setUserDataLoaded(false));
      dispatch(setAuthStatus(true));
      dispatch(setEmail(session.user.email));

      if (isGoogleUser) {
        if (!name && session.user.name) {
          dispatch(setName(session.user.name));
        }
        const isDefaultAvatar = !avatarUrl || avatarUrl === DEFAULT_AVATAR;
        if (isDefaultAvatar && session.user.image) {
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

        // Синхронизация корзины
        const localCart = localCartRef.current;
        const dbCart = data.cart || [];

        if (localCart.length > 0 || dbCart.length > 0) {
          // Объединяем локальную и базовую корзины по instanceId
          const mergedMap = new Map<string, any>();

          // Сначала добавляем все элементы из базы
          for (const item of dbCart) {
            const key = item.instanceId || String(item.id);
            mergedMap.set(key, item);
          }

          // Затем добавляем локальные, перезаписывая или дополняя
          for (const item of localCart) {
            const key = item.instanceId || String(item.id);
            if (!mergedMap.has(key)) {
              mergedMap.set(key, item);
            }
          }

          const mergedCart = Array.from(mergedMap.values());

          // Нормализуем для отправки/сохранения
          const normalizedCart = mergedCart.map((item: any) => ({
            id: String(item.id),
            instanceId: item.instanceId || String(item.id),
            count: item.count ?? 1,
          }));

          // Отправляем объединённую корзину на сервер
          await fetch("/api/user/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: session.user.email,
              cart: normalizedCart,
            }),
          });

          // Загружаем объединённую корзину в Redux
          dispatch(setItems(normalizedCart));
        }
        // Если обе пусты – ничего не делаем

        if (data.promoCodes) {
          dispatch(
            setPromoCodes({
              activated: data.promoCodes.activated || [],
              customAvailable: data.promoCodes.customAvailable || [],
            }),
          );
        }

        dispatch(setBalance(data.balance || 0));

        // Синхронизируем локальный город с сервером, если он был введён до входа
        const localCity = store.getState().user.geoCity;
        if (
          localCity &&
          localCity !== GEO_STATUS.DISABLED &&
          localCity !== GEO_STATUS.NOT_SUPPORTED &&
          localCity !== GEO_STATUS.NOT_DEFINED
        ) {
          try {
            await fetch("/api/user/update", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: session.user.email,
                city: localCity,
              }),
            });
          } catch (err) {
            console.error("Error syncing local city on sign-in:", err);
          }
        }

        // Синхронизация мета-данных – теперь с обработкой ошибок
        try {
          const localRatings = store.getState().productMeta.ratings;
          const localFavorites = store.getState().productMeta.favorites;

          const metaRes = await fetch("/api/user/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: session.user.email }),
          });

          if (metaRes.ok) {
            const meta = await metaRes.json();
            const serverRatings = meta.ratings || {};
            const serverFavorites = meta.favorites || [];

            // Если серверные рейтинги пусты, а локальные есть — сохраняем локальные на сервер
            if (
              Object.keys(serverRatings).length === 0 &&
              Object.keys(localRatings).length > 0
            ) {
              // Отправляем локальные данные на сервер (без ожидания ответа)
              fetch("/api/user/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: session.user.email,
                  ratings: localRatings,
                  favorites: localFavorites,
                }),
              }).catch(console.warn);

              // Помечаем, что метаданные синхронизированы, не трогая сами рейтинги
              dispatch(setMetaSynced(true));
            } else {
              // Серверные данные не пусты — используем их (или можно объединить, но пока так)
              dispatch(
                hydrateMeta({
                  ratings: serverRatings,
                  favorites: serverFavorites,
                }),
              );
            }
          } else {
            toast.error(t.toastTr.dataLoadError);
          }
        } catch {
          toast.error(t.toastTr.dataLoadError);
        }

        sessionStorage.removeItem("preLoginCartCount");

        // 3. Только теперь разрешаем отображение
        dispatch(setUserDataLoaded(true));
        sessionStorage.removeItem("googleAuthPending");
        dispatch(setGoogleSignIn(false));
      } catch (err: any) {
        console.error("Error loading user data:", err);
        sessionStorage.removeItem("preLoginCartCount");
        // Восстанавливаем локальную корзину при ошибке
        dispatch(setItems(localCartRef.current));
        toast.error(t.toastTr.dataLoadError);
        dispatch(setGoogleSignIn(false));
        dispatch(setUserDataLoaded(true));
      }
    };

    loadData();
  }, [status, session]);

  // Сохранение данных при их изменении
  useEffect(() => {
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

    const hasChanged =
      !arraysEqual(prev.items, current.items) ||
      !arraysEqual(prev.activated, current.activated) ||
      !arraysEqual(prev.customAvailable, current.customAvailable) ||
      prev.balance !== current.balance ||
      prev.avatarUrl !== current.avatarUrl ||
      prev.name !== current.name;

    if (!hasChanged) {
      return;
    }

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
    <SessionProvider refetchInterval={60 * 30} refetchOnWindowFocus={false}>
      <SyncAuthUserWithRedux />
      {children}
    </SessionProvider>
  );
}
