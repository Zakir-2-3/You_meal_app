"use client";

import { BalanceSectionProps } from "@/types/user/balance";

const BalanceSection = ({
  balance,
  currency,
  onTopUp,
  onWithdraw,
  translations,
}: BalanceSectionProps) => {
  return (
    <div className="personal-account__balance">
      <div className="personal-account__field">
        <label className="personal-account__label">
          {translations.balanceLabel}
        </label>
        <span className="personal-account__value">
          {balance} {currency === "rub" ? "₽" : "$"}
        </span>
      </div>
      <div className="personal-account__balance-controls">
        <button
          onClick={onTopUp}
          className="personal-account__button personal-account__button--primary"
        >
          {translations.topUp}
        </button>
        <button
          onClick={onWithdraw}
          className="personal-account__button personal-account__button--secondary"
        >
          {translations.withdraw}
        </button>
      </div>
    </div>
  );
};

export default BalanceSection;
