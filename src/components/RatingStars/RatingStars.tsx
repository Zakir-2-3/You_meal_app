"use client";

import React from "react";

import "./RatingStars.scss";

type Props = {
  value: number;
  onChange?: (v: number) => void;
};

export default function RatingStars({ value = 0, onChange }: Props) {
  const stars = [1, 2, 3, 4, 5];
  const isReadOnly = !onChange;

  return (
    <div className="rating-stars">
      {stars.map((s) => {
        const filled = s <= value;
        return (
          <button
            className="star-btn"
            key={s}
            type="button"
            onClick={() => !isReadOnly && onChange?.(s)}
            disabled={isReadOnly}
            aria-label={`Оценка ${s}`}
            style={{
              cursor: isReadOnly ? "default" : "pointer",
            }}
          >
            {filled ? "★" : "☆"}
          </button>
        );
      })}
      <span className="star-count">{value.toFixed(1).replace(".0", "")}/5</span>
    </div>
  );
}
