export async function detectGeoCity(): Promise<string> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      return resolve("Геолокация не поддерживается");
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
            "Геолокация отключена";
          resolve(cityName);
        } catch {
          resolve("Геолокация отключена");
        }
      },
      () => {
        resolve("Геолокация отключена");
      }
    );
  });
}
