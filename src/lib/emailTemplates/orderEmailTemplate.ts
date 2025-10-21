import { DEFAULT_PROMOS } from "@/constants/defaults";

import { Item } from "@/types/item";

type OrderEmailParams = {
  orderNumber: number;
  items: Item[];
  rawTotal: number;
  discount: number;
  vat: number;
  tips: number;
  tipsPercent: number;
  finalTotal: number;
  activated?: string[];
  lang?: "ru" | "en";
};

export const orderEmailTemplate = ({
  orderNumber,
  items,
  rawTotal,
  discount,
  vat,
  tips,
  tipsPercent,
  finalTotal,
  activated = [],
  lang = "ru",
}: OrderEmailParams) => {
  const texts = {
    ru: {
      title: `Ваш заказ №${orderNumber} <span style="white-space: nowrap;">оплачен ✅</span>`,
      thanks: "❤️ Спасибо, что выбрали <b>YourMeal</b> 🍔",
      qty: "Кол-во",
      price: "Цена",
      raw: "Чистый счёт",
      discount: "Скидка",
      vat: "НДС (5%)",
      tips: "Чаевые",
      total: "✅ Итого",
      eta: "⏳ Ваш заказ будет готов в течение <b>30 мин</b>.",
      notify:
        "Мы отправим уведомление, как только он будет доступен для получения.",
      rights: "Все права защищены.",
    },
    en: {
      title: `Your order №${orderNumber} <span style="white-space: nowrap;">has been paid ✅</span>`,
      thanks: "❤️ Thank you for choosing <b>YourMeal</b> 🍔",
      qty: "Qty",
      price: "Price",
      raw: "Subtotal",
      discount: "Discount",
      vat: "VAT (5%)",
      tips: "Tips",
      total: "✅ Total",
      eta: "⏳ Your order will be ready within <b>30 min</b>.",
      notify: "We’ll notify you when it’s ready for pickup.",
      rights: "All rights reserved.",
    },
  }[lang];

  // Скидки
  const discountLabels = activated
    .map((code) => {
      if (DEFAULT_PROMOS.includes(code)) {
        if (code === "PromoFirst10") return "10%";
        if (code === "PromoFrom2020" && rawTotal >= 2000) return "20%";
        return null;
      }
      return code;
    })
    .filter(Boolean);

  const discountedTotal = Math.round(rawTotal * (1 - discount / 100));
  const savedMoney = rawTotal - discountedTotal;

  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" align="center"
      style="background-color:#fff8f0;font-family:Arial,sans-serif;max-width:600px;margin:0 auto;
      border:3px solid #ff8800;border-radius:10px;box-shadow:0 0 10px rgba(0,0,0,0.1)">
      <tr><td>
        <!-- Header -->
        <table width="100%" style="background:#ffab08;padding:30px 20px">
          <tr>
            <td align="center" style="color:#fff">
              <h1 style="margin:0;font-size:22px">${texts.title}</h1>
              <p style="margin:5px 0;font-size:16px">${texts.thanks}</p>
            </td>
          </tr>
        </table>

        <!-- Items -->
        <table width="100%" cellpadding="10" cellspacing="0" style="background:#fff;padding:20px">
          ${items
            .map((item) => {
              const itemTotal = item.price_rub * (item.count ?? 0);
              return `
                <tr style="border-bottom:1px solid #eee">
                  <td width="80">
                    <img src="${
                      item.image
                    }" width="70" height="70" style="border-radius:8px"/>
                  </td>
                  <td style="font-size:14px;color:#333">
                    <div><b>${
                      lang === "ru" ? item.name_ru : item.name_en
                    }</b></div>
                    <div>${texts.qty}: ${item.count}</div>
                    <div>${texts.price}: ${itemTotal}₽</div>
                  </td>
                </tr>
              `;
            })
            .join("")}
        </table>

        <!-- Summary -->
        <table width="100%" cellpadding="10" style="background:#fff1e6;padding:15px">
          <tr><td>
            <p style="margin:4px 0">${texts.raw}: ${rawTotal}₽</p>
            <p style="margin:4px 0; color:#ff8000;">
              ${texts.discount}${
    discountLabels.length > 0 ? ` (${discountLabels.join(", ")})` : ""
  }: -${savedMoney}₽
            </p>
            <p style="margin:4px 0; color:#ff0000;">${texts.vat}: +${vat}₽</p>
            <p style="margin:4px 0">${texts.tips} (${tipsPercent || 0}%): +${
    tips || 0
  }₽</p>
            <h3 style="margin:8px 0; color:#28a745;">${
              texts.total
            }: ${finalTotal}₽</h3>
            <p style="margin:8px 0; font-size:14px; color:#555;">
              ${texts.eta}<br/>${texts.notify}
            </p>
          </td></tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="10" style="background:#fff;padding:15px">
          <tr><td align="center" style="font-size:12px;color:#999">
            © ${new Date().getFullYear()} YourMeal. ${texts.rights}
          </td></tr>
        </table>
      </td></tr>
    </table>
  `;
};
