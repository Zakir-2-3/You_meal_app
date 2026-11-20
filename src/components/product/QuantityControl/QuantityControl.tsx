"use client";

import { FC } from "react";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

import { QuantityControlProps } from "@/types/components/common/quantity-control";

import "./QuantityControl.scss";

const QuantityControl: FC<QuantityControlProps> = ({
  count,
  onClickPlus,
  onClickMinus,
}) => {
  const totalCount = useSelector((state: RootState) =>
    state.cart.items.reduce((sum, i) => sum + (i.count ?? 0), 0),
  );
  const isMaxReached = totalCount >= 99;

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
      <button
        onClick={onClickPlus}
        disabled={isMaxReached}
        className={isMaxReached ? "quantity-control__btn--disabled" : ""}
      >
        +
      </button>
    </div>
  );
};

export default QuantityControl;
