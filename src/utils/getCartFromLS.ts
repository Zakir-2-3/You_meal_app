import { calcTotalPrice } from "./calcTotalPrice";

export const getCartFromLS = () => {
  // Проверка, что код выполняется в браузере
  if (typeof window === "undefined") return { items: [], totalPrice: 0 };

  const data = localStorage.getItem("cart");
  const items = data ? JSON.parse(data) : [];
  const totalPrice = calcTotalPrice(items);

  return {
    items,
    totalPrice,
  };
};
