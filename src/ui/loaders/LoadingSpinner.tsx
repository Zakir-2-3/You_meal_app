import { LoadingSpinnerProps } from "@/types/components/ui/loading-spinner";

import "./LoadingSpinner.scss";

export default function LoadingSpinner({
  size = 60,
  color = "#ff7020",
}: LoadingSpinnerProps) {
  return (
    <div
      className="loading-spinner"
      style={{
        width: size,
        height: size,
        borderTopColor: color,
      }}
    />
  );
}
