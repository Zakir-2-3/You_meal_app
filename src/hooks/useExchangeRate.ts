import { useEffect, useState } from "react";

interface RateState {
  rate: number | null;
  loading: boolean;
  error: string | null;
}

export const useExchangeRate = (
  ttlMinutes = 1440,
  currency: "rub" | "usd" = "rub"
) => {
  const [state, setState] = useState<RateState>({
    rate: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;
    const cacheKey = "exchange_rate_rub_usd";
    const cached = localStorage.getItem(cacheKey);

    // Проверяем кеш
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const age = (Date.now() - parsed.ts) / 1000 / 60;
        if (age < ttlMinutes && parsed.rate) {
          setState({ rate: parsed.rate, loading: false, error: null });
          return;
        }
      } catch {}
    }

    const fetchRate = async () => {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        const json = await res.json();

        const rubPerUsd = json?.rates?.RUB;

        if (!rubPerUsd || typeof rubPerUsd !== "number") {
          throw new Error("Invalid data from exchange API");
        }

        // Сохраняем курс и время
        localStorage.setItem(
          cacheKey,
          JSON.stringify({ rate: rubPerUsd, ts: Date.now() })
        );

        if (mounted) setState({ rate: rubPerUsd, loading: false, error: null });
      } catch (err: any) {
        console.error("Ошибка получения курса:", err);
        if (mounted)
          setState({ rate: null, loading: false, error: err.message });
      }
    };

    fetchRate();

    return () => {
      mounted = false;
    };
  }, [ttlMinutes, currency]);

  return state;
};
