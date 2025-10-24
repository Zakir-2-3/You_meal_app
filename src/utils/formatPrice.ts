export function formatPrice(
  value: number,
  currency: "RUB" | "USD",
  locale = "ru-RU"
) {
  if (currency === "RUB") {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(value);
  }
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}
