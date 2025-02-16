"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

import TotalPriceItemListSkeleton from "../../ui/skeletons/TotalPriceItemListSkeleton";

import "./CartPageCheck.scss";

const CartPageCheck = () => {
  const { totalPrice, items } = useSelector((state: RootState) => state.cart);

  return (
    <>
      <h3 className="total-price-title">YourMeal Check</h3>
      <span className="total-price-date">Aug 14 06:40PM</span>
      <div className="total-price-item-list">
        <ul>
          {/* <TotalPriceItemListSkeleton/> */}
          {items.map((item) => (
            <li key={item.id}>
              <span>{item.count}</span>
              <span>{item.name_ru}</span>
              <span>
                {new Intl.NumberFormat("ru-RU").format(
                  item.price_rub * item.count
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="total-price-wrapper">
        <p>
          SUBTOTAL<span>{totalPrice}</span>
        </p>
        <p>
          TAX<span>4.00P</span>
        </p>
        <p>
          TOTAL DUE<span>50.00P</span>
        </p>
      </div>
      <p className="total-price-thank">THANK YOU FOR VISITING!</p>
      <div className="total-price-tips">
        <p>ЧАЕВЫЕ</p>
        <p>
          5% is <span>$5</span>
        </p>
        <p>
          10% is <span>$10</span>
        </p>
        <p>
          15% is <span>$15</span>
        </p>
      </div>
    </>
  );
};

export default CartPageCheck;
