"use client";

import { useState, useEffect, useRef } from "react";

import Image from "next/image";

import debounce from "lodash.debounce";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setGeoCity } from "@/store/slices/userSlice";

import { detectGeoCity } from "@/utils/geo";

import locationIcon from "@/assets/icons/location-icon.svg";

import "./GeoLocationSelector.scss";

const GeoLocationSelector = () => {
  const dispatch = useDispatch();
  const savedCity = useSelector((state: RootState) => state.user.geoCity);
  const email = useSelector((state: RootState) => state.user.email);

  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState(savedCity || "");
  const [city, setCity] = useState(savedCity || "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const [geoTried, setGeoTried] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Определить гео
  const tryGeoDetect = async () => {
    const cityName = await detectGeoCity();
    dispatch(setGeoCity(cityName));
    localStorage.setItem("city", cityName);
    setCity(cityName);
    setInputValue(cityName);
    setGeoTried(cityName === "Геолокация отключена");
  };

  // Инициализация
  useEffect(() => {
    if (
      !savedCity ||
      savedCity === "" ||
      savedCity === "Геолокация отключена"
    ) {
      const storedCity = localStorage.getItem("city");
      if (storedCity) {
        dispatch(setGeoCity(storedCity));
        setCity(storedCity);
        setInputValue(storedCity);
        return;
      }
      tryGeoDetect();
    } else {
      setCity(savedCity);
      setInputValue(savedCity);
    }
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
        setInputValue(city);
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
    if (city === "Геолокация отключена") {
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
      setInputValue(city === "Геолокация отключена" ? "" : city);
    } else {
      setInputVisible(false);
      setSuggestions([]);
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
            city === "Геолокация отключена"
              ? "geo-selector__icon--error"
              : "geo-selector__icon--success"
          }`}
          onClick={handleGeoClick}
          title={
            city === "Геолокация отключена"
              ? "Повторить попытку определить геолокацию или ввести вручную"
              : "Изменить город"
          }
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
            placeholder="Введите название"
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

      <span className="geo-selector__label">{city}</span>
    </div>
  );
};

export default GeoLocationSelector;
