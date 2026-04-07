"use client";

import { LottieIcon } from "@/components/ui/LottieIcon";

import { FavoriteButtonProps } from "@/types/components/common/favorite-button";

import favoriteAnimation from "@/assets/animations/favorite_animation.json";

const FavoriteButton = ({ isFav, onToggle }: FavoriteButtonProps) => {
  return (
    <div className="product-section__favorite-wrapper">
      <LottieIcon
        animationData={favoriteAnimation}
        onToggle={onToggle}
        trigger="toggleClick"
        size={80}
        hitBoxSize={34}
        activeFav={isFav}
      />
    </div>
  );
};

export default FavoriteButton;
