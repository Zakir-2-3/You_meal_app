export async function detectGeoCity(lang: "ru" | "en" = "ru"): Promise<string> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      return resolve("geolocation_not_supported");
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
          );
          const data = await res.json();
          const cityName =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            "geolocation_disabled";
          resolve(cityName);
        } catch {
          resolve("geolocation_disabled");
        }
      },
      () => {
        resolve("geolocation_disabled");
      }
    );
  });
}
