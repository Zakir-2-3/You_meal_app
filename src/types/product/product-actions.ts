export interface ProductActionsProps {
  count: number;
  isAdded: boolean;
  instanceId: string;
  onClickPlus: () => void;
  onClickMinus: () => void;
  onClickAdd: () => void;
  translations: {
    addToCart: string;
    removeFromCart: string;
  };
}
