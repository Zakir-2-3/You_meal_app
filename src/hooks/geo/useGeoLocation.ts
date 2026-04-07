import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import debounce from "lodash.debounce";

import { AppDispatch, RootState } from "@/store/store";
import { setGeoCity } from "@/store/slices/userSlice";

import { detectGeoCity } from "@/utils/common/geo";

import { useTranslate } from "@/hooks/app/useTranslate";

import { GEO_STATUS } from "@/constants/user/geoStatus";

export const useGeoLocation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const savedCity = useSelector((state: RootState) => state.user.geoCity);
  const email = useSelector((state: RootState) => state.user.email);
  const { t, lang } = useTranslate();

  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const [iconStatus, setIconStatus] = useState<"success" | "error">("success");
  const [initialized, setInitialized] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { disabledGeo, notSupportedGeo, geoNotDefined } = t.geo;

  const isGeoError = useCallback((cityName: string): boolean => {
    return (
      cityName === GEO_STATUS.DISABLED ||
      cityName === GEO_STATUS.NOT_SUPPORTED ||
      cityName === GEO_STATUS.NOT_DEFINED
    );
  }, []);

  const getDisplayCity = useCallback(
    (cityName: string): string => {
      if (cityName === GEO_STATUS.DISABLED) return disabledGeo;
      if (cityName === GEO_STATUS.NOT_SUPPORTED) return notSupportedGeo;
      if (cityName === GEO_STATUS.NOT_DEFINED) return geoNotDefined;
      return cityName;
    },
    [disabledGeo, notSupportedGeo, geoNotDefined],
  );

  const updateIconStatus = useCallback(
    (cityName: string) => {
      setIconStatus(isGeoError(cityName) ? "error" : "success");
    },
    [isGeoError],
  );

  const saveCity = useCallback(
    async (selectedCity: string) => {
      dispatch(setGeoCity(selectedCity));
      localStorage.setItem("city", selectedCity);
      setCity(selectedCity);
      setInputValue(getDisplayCity(selectedCity));
      updateIconStatus(selectedCity);

      if (email) {
        try {
          await fetch("/api/user/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, city: selectedCity }),
          });
        } catch (err) {
          console.error("Error saving city in Supabase:", err);
        }
      }
    },
    [dispatch, email, getDisplayCity, updateIconStatus],
  );

  const tryGeoDetect = useCallback(async (): Promise<boolean> => {
    const cityName = await detectGeoCity(lang);

    let status = cityName;
    if (cityName === disabledGeo) status = GEO_STATUS.DISABLED;
    if (cityName === notSupportedGeo) status = GEO_STATUS.NOT_SUPPORTED;
    if (cityName === geoNotDefined) status = GEO_STATUS.NOT_DEFINED;

    await saveCity(status);
    return true;
  }, [lang, disabledGeo, notSupportedGeo, geoNotDefined, saveCity]);

  const closeInput = useCallback(() => {
    setInputVisible(false);
    setSuggestions([]);

    if (!inputValue.trim()) {
      saveCity(GEO_STATUS.NOT_DEFINED);
    } else {
      saveCity(inputValue.trim());
    }
  }, [inputValue, saveCity]);

  // Инициализация
  useEffect(() => {
    const initializeCity = async () => {
      if (initialized) return;

      if (!savedCity || savedCity === "" || isGeoError(savedCity)) {
        const storedCity = localStorage.getItem("city");

        if (storedCity === GEO_STATUS.NOT_DEFINED) {
          await saveCity(GEO_STATUS.NOT_DEFINED);
          setInitialized(true);
          return;
        }

        if (storedCity && !isGeoError(storedCity)) {
          await saveCity(storedCity);
        } else {
          await tryGeoDetect();
        }
      } else {
        await saveCity(savedCity);
      }

      setInitialized(true);
    };

    initializeCity();
  }, [savedCity, isGeoError, saveCity, tryGeoDetect, initialized]);

  // Загрузка подсказок
  useEffect(() => {
    if (!inputValue.trim() || !hasUserTyped) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = debounce(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            inputValue,
          )}&format=json&limit=5`,
        );
        const data = await res.json();
        const cities = data.map(
          (item: any) => item.display_name?.split(",")[0],
        );
        setSuggestions([...new Set<string>(cities)]);
      } catch {
        setSuggestions([]);
      }
    }, 400);

    fetchSuggestions();
    return () => fetchSuggestions.cancel();
  }, [inputValue, hasUserTyped]);

  // Клик вне компонента
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        inputVisible &&
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        closeInput();
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [inputVisible, closeInput]);

  // Фокус и скролл
  useEffect(() => {
    if (inputVisible && inputRef.current) {
      inputRef.current.focus();
      const val = inputRef.current.value;
      inputRef.current.setSelectionRange(val.length, val.length);
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.scrollLeft = inputRef.current.scrollWidth;
        }
      });
    }
  }, [inputVisible]);

  return {
    inputVisible,
    inputValue,
    city,
    suggestions,
    hasUserTyped,
    iconStatus,
    wrapperRef,
    inputRef,
    t,
    setInputVisible,
    setInputValue,
    setHasUserTyped,
    setSuggestions,
    handleGeoIconClick: tryGeoDetect,
    handleLabelClick: () => {
      if (!inputVisible) {
        setInputVisible(true);
        setHasUserTyped(false);
        setInputValue(isGeoError(city) ? "" : getDisplayCity(city));
      }
    },
    handleCloseInput: closeInput,
    handleClearClick: () => {
      if (inputValue.trim()) {
        setInputValue("");
        setHasUserTyped(false);
        setSuggestions([]);
        inputRef.current?.focus();
      } else {
        closeInput();
      }
    },
    handleSuggestionClick: (selectedCity: string) => {
      saveCity(selectedCity);
      setSuggestions([]);
      setInputVisible(false);
    },
    handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === "Escape") {
        closeInput();
      }
    },
    getDisplayCity,
    isGeoError,
  };
};
