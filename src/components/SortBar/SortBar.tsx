"use client";

import React, { useState, useRef, useEffect } from "react";

import { SortBy, SortDir } from "@/store/slices/productMetaSlice";

import { SORT_OPTIONS } from "@/constants/sortOptions";

import "./SortBar.scss";

type Props = {
  by: SortBy;
  dir: SortDir;
  onChange: (next: { by: SortBy; dir: SortDir }) => void;
};

export default function SortBar({ by, dir, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const canUseDir = by !== "default" && by !== "favorites";

  // Закрытие по клику вне
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="sort-bar">
      <label className="sort-bar__label">Сортировка:</label>

      <div className="sort-bar__dropdown" ref={dropdownRef}>
        <button
          className="sort-bar__toggle"
          onClick={() => setIsOpen((p) => !p)}
        >
          {SORT_OPTIONS.find((opt) => opt.value === by)?.label}
          <span
            className={`sort-bar__arrow ${
              isOpen ? "sort-bar__arrow--open" : ""
            }`}
          >
            ▼
          </span>
        </button>

        <div
          className={`sort-bar__menu ${isOpen ? "sort-bar__menu--open" : ""}`}
        >
          {SORT_OPTIONS.map((opt) => (
            <div
              key={opt.value}
              className={`sort-bar__option ${
                by === opt.value ? "sort-bar__option--active" : ""
              }`}
              onClick={() => {
                onChange({ by: opt.value, dir });
                setIsOpen(false); // плавное закрытие после выбора
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      </div>

      <div className="sort-bar__dir">
        <button
          onClick={() => canUseDir && onChange({ by, dir: "desc" })}
          disabled={!canUseDir}
          className={`sort-bar__dir-btn ${
            dir === "desc" && canUseDir ? "sort-bar__dir-btn--active" : ""
          }`}
        >
          ⇑
        </button>
        <button
          onClick={() => canUseDir && onChange({ by, dir: "asc" })}
          disabled={!canUseDir}
          className={`sort-bar__dir-btn ${
            dir === "asc" && canUseDir ? "sort-bar__dir-btn--active" : ""
          }`}
        >
          ⇓
        </button>
      </div>
    </div>
  );
}
