"use client";

import React from "react";

import "./RatingStars.scss";

type Props = {
  value: number;
  onChange?: (v: number) => void;
  as?: "div" | "span";
};

export default function RatingStars({
  value = 0,
  onChange,
  as = "div",
}: Props) {
  const stars = [1, 2, 3, 4, 5];
  const isReadOnly = !onChange;
  const Tag = as;

  return (
    <Tag className="rating-stars">
      {stars.map((s) => {
        const filled = s <= value;

        // Для read-only режима используем span вместо button
        if (isReadOnly) {
          return (
            <span
              className="star-btn star-btn--static"
              key={s}
              aria-label={`Оценка ${s}`}
            >
              {filled ? "★" : "☆"}
            </span>
          );
        }

        // Для интерактивного режима используем button
        return (
          <button
            className="star-btn"
            key={s}
            type="button"
            onClick={() => onChange?.(s)}
            aria-label={`Оценка ${s}`}
          >
            {filled ? "★" : "☆"}
          </button>
        );
      })}
      <span className="star-count">{value.toFixed(1).replace(".0", "")}/5</span>
    </Tag>
  );
}
