import { useEffect, useState } from "react";

import { useAppSelector } from "@/store/store";

export function useGeolocation() {
  const [location, setLocation] = useState<{ city: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const email = useAppSelector((state) => state.user.email);
  const isAuth = useAppSelector((state) => state.user.isAuth);

  useEffect(() => {
    const cached = localStorage.getItem("userCity");
    if (cached) {
      setLocation({ city: cached });
      setLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setError("Геолокация не поддерживается");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.state ||
            "Неизвестно";

          setLocation({ city });
          localStorage.setItem("userCity", city);

          // Сохраняем в Supabase если вошёл
          if (isAuth && email) {
            await fetch("/api/user/update", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, city }),
            });
          }
        } catch (err) {
          setError("Не удалось определить местоположение");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError("Разрешение на геолокацию отклонено");
        setLoading(false);
      }
    );
  }, [email, isAuth]);

  return { location, loading, error, setLocation };
}
