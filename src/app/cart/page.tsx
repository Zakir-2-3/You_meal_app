import CartClient from "./CartClient";
import NavButtons from "@/components/NavButtons/NavButtons";

export default function CartPage() {
  return (
    <section className="cart-page-section">
      <div className="container cart-page-container">
        <h1 className="cart-page-section__title">Корзина</h1>
        <NavButtons customTitle="Корзина" />
        <CartClient />
      </div>
    </section>
  );
}
