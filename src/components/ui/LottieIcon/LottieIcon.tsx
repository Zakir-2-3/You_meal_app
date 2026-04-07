"use client";

import { useEffect, useRef, useState } from "react";

import Lottie, { LottieRefCurrentProps } from "lottie-react";

import { LottieIconProps } from "@/types/components/common/lottie-icon";

const LottieIcon = ({
  animationData,
  trigger = "hover",
  size = 40,
  loop = false,
  isHovered = false,
  onToggle,
  hitBoxSize,
  activeFav = false,
  enabled = true,
}: LottieIconProps) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [isActive, setIsActive] = useState<boolean>(activeFav);
  const [hasMounted, setHasMounted] = useState(false);

  const containerSize = hitBoxSize || size;

  useEffect(() => {
    if (trigger !== "toggleClick" || !lottieRef.current) return;

    if (!hasMounted) {
      if (activeFav) {
        const duration = lottieRef.current?.getDuration(true);
        if (typeof duration === "number") {
          lottieRef.current?.goToAndStop(duration, true);
        }
      } else {
        lottieRef.current?.goToAndStop(0, true);
      }

      setHasMounted(true);
      return;
    }

    if (activeFav) {
      lottieRef.current.stop();
      lottieRef.current.play();
      setIsActive(true);
    } else {
      lottieRef.current.stop();
      lottieRef.current.goToAndStop(0, true);
      setIsActive(false);
    }
  }, [activeFav, trigger, hasMounted]);

  useEffect(() => {
    if (!enabled) {
      lottieRef.current?.pause();
      lottieRef.current?.goToAndStop(0, true);
      return;
    }

    if (trigger === "always") {
      lottieRef.current?.play();
      return;
    }

    if (trigger.includes("load")) {
      lottieRef.current?.play();
    }
  }, [enabled, trigger]);

  useEffect(() => {
    if (trigger.includes("hover") && isHovered) {
      lottieRef.current?.stop();
      lottieRef.current?.play();
    }
  }, [isHovered, trigger]);

  const handleMouseEnter = () => {
    if (trigger.includes("hover") && !isHovered) {
      lottieRef.current?.stop();
      lottieRef.current?.play();
    }
  };

  const handleClick = () => {
    if (!lottieRef.current) return;

    if (trigger === "click") {
      lottieRef.current.stop();
      lottieRef.current.play();
      return;
    }

    if (trigger === "toggleClick") {
      onToggle?.();
    }
  };

  return (
    <div
      style={{
        width: containerSize,
        height: containerSize,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "visible",
      }}
      className={isActive ? "active-fav" : ""}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
    >
      <Lottie
        style={{
          width: size,
          height: size,
          position: "absolute",
          pointerEvents: "none",
        }}
        lottieRef={lottieRef}
        animationData={animationData}
        loop={trigger === "always" || loop}
        autoplay={false}
      />
    </div>
  );
};

export default LottieIcon;
