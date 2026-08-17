"use client";

import { ReactNode, useEffect, useState } from "react";

import { PersistGate } from "redux-persist/integration/react";

import { useDispatch, useSelector } from "react-redux";
import { persistor, RootState } from "@/store/store";
import { setHydrated } from "@/store/slices/userSlice";
import { setLanguage } from "@/store/slices/languageSlice";

import { STORAGE_LANG, STORAGE_LANG_INIT } from "@/constants/app/storageKeys";

export default function PersistGateWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  const dispatch = useDispatch();
  const currentLang = useSelector((state: RootState) => state.language.current);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Автоопределение языка (только при первом запуске)
  useEffect(() => {
    if (!isClient) return;

    const initDone = localStorage.getItem(STORAGE_LANG_INIT);
    if (!initDone) {
      // Самый первый запуск – определяем язык по браузеру
      const browserLang = navigator.language || "";
      const detected = browserLang.startsWith("en") ? "en" : "ru";
      dispatch(setLanguage(detected));
      localStorage.setItem(STORAGE_LANG, detected);
      localStorage.setItem(STORAGE_LANG_INIT, "true");
    } else {
      // При каждом старте восстанавливаем язык из localStorage
      const storedLang = localStorage.getItem(STORAGE_LANG);
      if (storedLang && (storedLang === "en" || storedLang === "ru")) {
        if (storedLang !== currentLang) {
          dispatch(setLanguage(storedLang));
        }
      }
    }
  }, [isClient, dispatch, currentLang]);

  if (!isClient) return null;

  return (
    <PersistGate
      loading={null}
      persistor={persistor}
      onBeforeLift={() => {
        dispatch(setHydrated(true));
      }}
    >
      {children}
    </PersistGate>
  );
}
