"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

import { translations } from "@/i18n/translations";

export function useTranslate() {
  const lang = useSelector((state: RootState) => state.language.current) as
    | "ru"
    | "en";

  return { t: translations[lang], lang };
}
