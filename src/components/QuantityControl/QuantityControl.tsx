"use client";

import { FC } from "react";

import { QuantityControlProps } from "@/types/quantityControl";

import "./QuantityControl.scss";

const QuantityControl: FC<QuantityControlProps> = ({
  count,
  onClickPlus,
  onClickMinus,
}) => {
  return (
    <div
      className="quantity-control"
      style={{
        pointerEvents: count === 0 ? "none" : "auto",
        opacity: count === 0 ? 0.5 : 1,
      }}
    >
      <button onClick={onClickMinus}>-</button>
      <span style={{ color: count === 99 ? "red" : "inherit" }}>{count}</span>
      <button onClick={onClickPlus}>+</button>
    </div>
  );
};

export default QuantityControl;
