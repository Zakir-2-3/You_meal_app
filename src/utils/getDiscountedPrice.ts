export const getDiscountedPrice = (
  activated: string[],
  totalCartPrice: number
) => {
  let discount = 0;

  // 10% скидка на первый заказ
  if (activated.includes("PromoFirst10")) {
    discount += 10;
  }

  // 20% при сумме от 2000₽
  if (activated.includes("PromoFrom2020") && totalCartPrice >= 2000) {
    discount += 20;
  }

  return {
    discount,
    hasDiscount: discount > 0,
  };
};
