import { useState, useEffect, useRef, useCallback } from "react";

import { useTranslate } from "@/hooks/app/useTranslate";

import { UseModalCloseProps } from "@/types/hooks/use-modal-close";

export const useModalClose = ({ onClose, imageSrc }: UseModalCloseProps) => {
  const [closing, setClosing] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const { t } = useTranslate();
  const { imageChangeWindowAlert } = t.buttons;

  const handleRequestClose = useCallback(() => {
    if (imageSrc) {
      const confirmed = window.confirm(imageChangeWindowAlert);
      if (!confirmed) return;
    }

    setClosing(true);
    setTimeout(() => {
      onClose();
      setClosing(false);
    }, 300);
  }, [imageSrc, onClose, imageChangeWindowAlert]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleRequestClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleRequestClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleRequestClose]);

  return {
    closing,
    modalRef,
    handleRequestClose,
  };
};
