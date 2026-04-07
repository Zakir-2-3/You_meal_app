export type PromoCodeType = "default" | "custom";

export interface PromoCodeItem {
  code: string;
  type: PromoCodeType;
  description: string;
  isActive?: boolean;
}

export interface PromoSectionProps {
  translations: {
    promoCodeLabel: string;
    enterPromoCodePlaceholder: string;
    promoCodeMax: string;
    promoCodeMin: string;
    activateTr: string;
    maxActivatedMessage?: string;
  };
}

export interface PromoInputProps {
  value: string;
  onChange: (value: string) => void;
  error: string;
  disabled: boolean;
  placeholder: string;
  onActivate: () => void;
  activateText: string;
  canAddNewCustomPromo?: boolean;
  isDefaultPromo?: boolean;
  maxLengthReached?: boolean;
  maxLengthMessage?: string;
  maxActivatedReached?: boolean;
  maxActivatedMessage?: string;
}

export interface ActivePromosProps {
  activatedPromoCodes: string[];
  removingPromo: string | null;
  onRemovePromo: (code: string) => void;
}

export interface PromoCodeListDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  availablePromoCodes: string[];
  maxPromosReached: boolean;
  onSelectPromo: (code: string) => void;
  onDeletePromo: (code: string) => void;
  onToggle: () => void;
}
