export interface BalanceSectionProps {
  balance: number;
  currency: string;
  onTopUp: () => void;
  onWithdraw: () => void;
  translations: {
    balanceLabel: string;
    topUp: string;
    withdraw: string;
  };
}
