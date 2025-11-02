"use client";

import { useEffect, useRef, useState } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

interface LottieIconProps {
  animationData: any;
  trigger?:
    | "hover"
    | "click"
    | "load"
    | "hover+load"
    | "always"
    | "toggleClick";
  size?: number;
  loop?: boolean;
  isHovered?: boolean;
  className?: string;
  hitBoxSize?: number;
  activeFav?: boolean;
  onToggle?: () => void;
}

const LottieIcon = ({
  animationData,
  trigger = "hover",
  size = 40,
  loop = false,
  isHovered = false,
  onToggle,
  hitBoxSize,
  activeFav = false,
}: LottieIconProps) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [isActive, setIsActive] = useState<boolean>(activeFav);
  const [hasMounted, setHasMounted] = useState(false);

  const containerSize = hitBoxSize || size;

  useEffect(() => {
    if (trigger !== "toggleClick" || !lottieRef.current) return;

    if (!hasMounted) {
      // при первом рендере просто ставим финальный кадр без проигрывания
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

    // при изменении состояния во время работы (клик)
    if (activeFav) {
      lottieRef.current.stop();
      lottieRef.current.play();
      setIsActive(true);
    } else {
      lottieRef.current.stop();
      lottieRef.current.goToAndStop(0, true); // сбросить
      setIsActive(false);
    }
  }, [activeFav, trigger, hasMounted]);

  useEffect(() => {
    if (trigger === "always") {
      lottieRef.current?.play();
      return;
    }

    if (trigger.includes("load")) {
      lottieRef.current?.play();
    }
  }, [trigger]);

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
        cursor: "pointer",
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
