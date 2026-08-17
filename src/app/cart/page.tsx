"use client";

import NavButtons from "@/components/layout/NavButtons/NavButtons";
import CartClient from "./CartClient";

import { useTranslate } from "@/hooks/app/useTranslate";

export default function CartPage() {
  const { t } = useTranslate();

  const { title } = t.cart;

  return (
    <section className="cart-page-section">
      <div className="container cart-page-container">
        <h1 className="cart-page-section__title">{title}</h1>
        <NavButtons />
        <CartClient />
      </div>
    </section>
  );
}
