import { useEffect, useState, useCallback } from "react";

export const useResendTimer = (initialSeconds = 10, autoStart = true) => {
  const [secondsLeft, setSecondsLeft] = useState(
    autoStart ? initialSeconds : 0
  );
  const [canResend, setCanResend] = useState(autoStart ? false : true);

  useEffect(() => {
    if (secondsLeft <= 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft]);

  const startTimer = useCallback((duration: number) => {
    setSecondsLeft(duration);
    setCanResend(false);
  }, []);

  const formatTime = () => {
    if (secondsLeft < 60) return `${secondsLeft}`;

    const hours = Math.floor(secondsLeft / 3600);
    const minutes = Math.floor((secondsLeft % 3600) / 60);
    const seconds = secondsLeft % 60;

    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return {
    canResend,
    secondsLeft,
    startTimer,
    formatTime,
  };
};
