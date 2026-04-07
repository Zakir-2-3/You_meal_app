import { FC } from "react";

import { LoadMoreButtonProps } from "@/types/product/load-more-button";

export const LoadMoreButton: FC<LoadMoreButtonProps> = ({
  onClick,
  label,
  noMorePulse,
}) => {
  return (
    <button
      className={`food-section__load-more ${
        noMorePulse ? "food-section__load-more--nudge" : ""
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
