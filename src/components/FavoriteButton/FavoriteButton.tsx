"use client";

import React from "react";

import "./FavoriteButton.scss";

type Props = {
  active: boolean;
  onToggle: () => void;
};

export default function FavoriteButton({ active, onToggle }: Props) {
  return (
    <button
      className="product-section__favorite-button"
      onClick={onToggle}
      aria-label={active ? "Убрать из избранного" : "В избранное"}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        className={
          active
            ? "product-section__favorite-icon product-section__favorite-icon--active"
            : "product-section__favorite-icon"
        }
      >
        {active ? (
          // Активное состояние (заполненное)
          <path
            fill="#ff4444"
            d="M12 23.2l-.6-.5C8.7 20.7 0 13.5 0 7.3 0 3.8 2.9 1 6.5 1c2.2 0 4.3 1.1 5.5 2.9C13.2 2.1 15.3 1 17.5 1 21.1 1 24 3.8 24 7.3c0 6.3-8.7 13.4-11.4 15.5l-.6.4z"
          />
        ) : (
          // Неактивное состояние (контур)
          <path
            fill="#c4c4c4"
            d="M12,23.2l-0.6-0.5C8.7,20.7,0,13.5,0,7.3C0,3.8,2.9,1,6.5,1c2.2,0,4.3,1.1,5.5,2.9l0,0l0,0C13.2,2.1,15.3,1,17.5,1
          C21.1,1,24,3.8,24,7.3c0,6.3-8.7,13.4-11.4,15.5L12,23.2z M6.5,2.9C4,2.9,2,4.8,2,7.2c0,4.1,5.1,9.5,10,13.4
          c4.9-3.9,10-9.3,10-13.4c0-2.4-2-4.3-4.5-4.3c-1.6,0-3,0.8-3.8,2L12,7.6L10.3,5C9.5,3.7,8.1,2.9,6.5,2.9z"
          />
        )}
      </svg>
    </button>
  );
}
