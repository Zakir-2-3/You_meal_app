"use client";

import { useState, useEffect, useRef } from "react";

import Image from "next/image";

import debounce from "lodash.debounce";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setGeoCity } from "@/store/slices/userSlice";

import { detectGeoCity } from "@/utils/geo";

import { useTranslate } from "@/hooks/useTranslate";

import locationIcon from "@/assets/icons/location-icon.svg";

import "./GeoLocationSelector.scss";

// Константы для статусов геолокации
const GEO_STATUS = {
  DISABLED: "geolocation_disabled",
  NOT_SUPPORTED: "geolocation_not_supported",
} as const;

const GeoLocationSelector = () => {
  const dispatch = useDispatch();
  const savedCity = useSelector((state: RootState) => state.user.geoCity);
  const email = useSelector((state: RootState) => state.user.email);

  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const [geoTried, setGeoTried] = useState(false);

  const { t, lang } = useTranslate();
  const {
    disabledGeo,
    enterCityGeo,
    retryGeo,
    changeCityGeo,
    notSupportedGeo,
  } = t.geo;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Функция для определения, является ли город ошибкой геолокации
  const isGeoError = (cityName: string): boolean => {
    return (
      cityName === GEO_STATUS.DISABLED || cityName === GEO_STATUS.NOT_SUPPORTED
    );
  };

  // Функция для получения отображаемого названия города
  const getDisplayCity = (cityName: string): string => {
    if (cityName === GEO_STATUS.DISABLED) return disabledGeo;
    if (cityName === GEO_STATUS.NOT_SUPPORTED) return notSupportedGeo;
    return cityName;
  };

  // Определить гео
  const tryGeoDetect = async () => {
    const cityName = await detectGeoCity(lang);

    // Сохраняем статус вместо переведенного текста
    let status = cityName;
    if (cityName === disabledGeo) status = GEO_STATUS.DISABLED;
    if (cityName === notSupportedGeo) status = GEO_STATUS.NOT_SUPPORTED;

    dispatch(setGeoCity(status));
    localStorage.setItem("city", status);
    setCity(status);
    setInputValue(getDisplayCity(status));
    setGeoTried(status === GEO_STATUS.DISABLED);
  };

  useEffect(() => {
    const initializeCity = async () => {
      if (!savedCity || savedCity === "" || isGeoError(savedCity)) {
        const storedCity = localStorage.getItem("city");
        if (storedCity && !isGeoError(storedCity)) {
          // Если в localStorage не пустой город
          dispatch(setGeoCity(storedCity));
          setCity(storedCity);
          setInputValue(storedCity);
        } else {
          // Пытаемся определить геолокацию
          await tryGeoDetect();
        }
      } else {
        // Используем сохраненный город
        setCity(savedCity);
        setInputValue(getDisplayCity(savedCity));
      }
    };

    initializeCity();
  }, [savedCity, dispatch]);

  // Клик вне компонента
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        inputVisible &&
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setInputVisible(false);
        setSuggestions([]);
        setInputValue(getDisplayCity(city));
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [inputVisible, city]);

  useEffect(() => {
    if (!inputValue.trim()) {
      setSuggestions([]);
      setHasUserTyped(false);
      return;
    }

    const fetchSuggestions = debounce(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            inputValue
          )}&format=json&limit=5`
        );
        const data = await res.json();
        const cities = data.map(
          (item: any) => item.display_name?.split(",")[0]
        );
        setSuggestions([...new Set<string>(cities)]);
      } catch {
        setSuggestions([]);
      }
    }, 400);

    if (hasUserTyped) {
      fetchSuggestions();
    }

    return () => fetchSuggestions.cancel();
  }, [inputValue, hasUserTyped]);

  // Фокус и скролл вправо
  useEffect(() => {
    if (inputVisible && inputRef.current) {
      const input = inputRef.current;
      input.focus();
      const val = input.value;
      input.setSelectionRange(val.length, val.length);
      requestAnimationFrame(() => {
        input.scrollLeft = input.scrollWidth;
      });
    }
  }, [inputVisible]);

  // Клик по иконке гео
  const handleGeoClick = async () => {
    if (isGeoError(city)) {
      try {
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({
            name: "geolocation" as PermissionName,
          });

          if (permission.state === "granted" || permission.state === "prompt") {
            tryGeoDetect();
            return;
          }
        }
      } catch {
        tryGeoDetect();
        return;
      }
    }

    if (!inputVisible) {
      setInputVisible(true);
      setHasUserTyped(false);
      setInputValue(isGeoError(city) ? "" : city);
    } else {
      setInputVisible(false);
      setSuggestions([]);
      setInputValue(getDisplayCity(city));
    }
  };

  const handleSave = async (selectedCity: string) => {
    dispatch(setGeoCity(selectedCity));
    localStorage.setItem("city", selectedCity);
    setCity(selectedCity);
    setInputValue(selectedCity);
    setSuggestions([]);
    setInputVisible(false);

    if (email) {
      try {
        await fetch("/api/user/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, city: selectedCity }),
        });
      } catch (err) {
        console.error("Ошибка сохранения города в Supabase:", err);
      }
    }
  };

  return (
    <div
      className={`geo-selector ${inputVisible ? "input-visible" : ""}`}
      ref={wrapperRef}
    >
      <div className="geo-selector__container">
        <button
          className={`geo-selector__icon ${
            isGeoError(city)
              ? "geo-selector__icon--error"
              : "geo-selector__icon--success"
          }`}
          onClick={handleGeoClick}
          title={isGeoError(city) ? retryGeo : changeCityGeo}
        >
          <Image src={locationIcon} alt="geo" width={16} height={16} />
        </button>

        <div
          className={`geo-selector__input-wrapper ${
            inputVisible ? "geo-selector__input-wrapper--visible" : ""
          }`}
        >
          <input
            type="text"
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setHasUserTyped(true);
              if (!e.target.value.trim()) {
                setSuggestions([]);
              }
            }}
            className="geo-selector__input"
            placeholder={enterCityGeo}
            autoFocus={inputVisible}
          />
          {hasUserTyped && inputValue.trim() && suggestions.length > 0 && (
            <ul className="geo-selector__suggestions">
              {suggestions.map((s) => (
                <li
                  key={s}
                  className="geo-selector__suggestion"
                  onClick={() => handleSave(s)}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <span className="geo-selector__label">{getDisplayCity(city)}</span>
    </div>
  );
};

export default GeoLocationSelector;
