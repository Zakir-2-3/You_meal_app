import { useEffect, useState } from "react";

export const useExchangeRate = (currency: "rub" | "usd" = "rub") => {
  const [state, setState] = useState({
    rate: null as number | null,
    loading: currency === "usd",
    error: null as string | null,
  });

  useEffect(() => {
    if (currency === "rub") {
      setState({ rate: null, loading: false, error: null });
      return;
    }

    let mounted = true;
    const cacheKey = "exchange_rate_rub_usd";
    const cached = localStorage.getItem(cacheKey);

    // Проверяем кеш
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const age = (Date.now() - parsed.ts) / 1000 / 60;
        if (age < 1440 && parsed.rate) {
          setState({ rate: parsed.rate, loading: false, error: null });
          return;
        }
      } catch {}
    }

    setState((prev) => ({ ...prev, loading: true }));

    const fetchRate = async () => {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const json = await res.json();
        const rubPerUsd = json?.rates?.RUB;

        if (!rubPerUsd || typeof rubPerUsd !== "number") {
          throw new Error("Invalid data from exchange API");
        }

        localStorage.setItem(
          cacheKey,
          JSON.stringify({ rate: rubPerUsd, ts: Date.now() })
        );

        if (mounted) setState({ rate: rubPerUsd, loading: false, error: null });
      } catch (err: any) {
        console.error("Ошибка получения курса:", err);
        if (mounted)
          setState({
            rate: null,
            loading: false,
            error: "API недоступен",
          });
      }
    };

    fetchRate();

    return () => {
      mounted = false;
    };
  }, [currency]);

  return state;
};
