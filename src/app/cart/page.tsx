"use client";

import CartClient from "./CartClient";
import NavButtons from "@/components/NavButtons/NavButtons";

import { useTranslate } from "@/hooks/useTranslate";

export default function CartPage() {
  const { t } = useTranslate();

  const { title } = t.cart;

  return (
    <section className="cart-page-section">
      <div className="container cart-page-container">
        <h1 className="cart-page-section__title">{title}</h1>
        <NavButtons customTitle={title} />
        <CartClient />
      </div>
    </section>
  );
}
