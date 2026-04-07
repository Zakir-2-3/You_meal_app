export interface LottieIconProps {
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
  enabled?: boolean;
  onToggle?: () => void;
}
