"use client";

import React, { useRef, useEffect, ClipboardEvent, KeyboardEvent } from "react";

import { CodeInputProps } from "@/types/components/auth/code-input";

import "./CodeInput.scss";

const DIGITS = 6;

const CodeInput = ({
  value,
  onChange,
  disabled = false,
  id,
}: CodeInputProps) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const prevValueRef = useRef(value);

  // Синхронизируем ячейки, только если внешний value действительно изменился
  useEffect(() => {
    if (value === prevValueRef.current) return;
    prevValueRef.current = value;

    const cleanValue = value.replace(/\D/g, "").slice(0, DIGITS);
    inputsRef.current.forEach((input, idx) => {
      if (input) {
        input.value = cleanValue[idx] || "";
      }
    });
  }, [value]);

  const focusInput = (index: number) => {
    inputsRef.current[index]?.focus();
  };

  const getDigits = (): string => {
    return inputsRef.current
      .map((input) => (input?.value || "").replace(/\s/g, ""))
      .join("");
  };

  const notifyChange = () => {
    onChange(getDigits());
  };

  const handleChange = (index: number) => {
    const input = inputsRef.current[index];
    if (!input) return;

    const val = input.value.replace(/\D/g, "").slice(-1);
    input.value = val;

    if (val) {
      if (index < DIGITS - 1) focusInput(index + 1);
    }

    notifyChange();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const input = inputsRef.current[index];
      if (input && !input.value && index > 0) {
        const prev = inputsRef.current[index - 1];
        if (prev) {
          prev.value = "";
          focusInput(index - 1);
          notifyChange();
          e.preventDefault();
        }
      } else if (input && input.value) {
        input.value = "";
        notifyChange();
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text =
      e.clipboardData?.getData("text")?.replace(/\D/g, "").slice(0, DIGITS) ||
      "";
    const chars = text.split("");
    inputsRef.current.forEach((input, idx) => {
      if (input) input.value = chars[idx] || "";
    });
    const lastFilled = Math.min(chars.length, DIGITS - 1);
    focusInput(lastFilled);
    notifyChange();
  };

  const handleFocus = (index: number) => {
    // Ищем первый пустой инпут среди предыдущих
    for (let i = 0; i < index; i++) {
      const input = inputsRef.current[i];
      if (input && !input.value) {
        focusInput(i);
        return;
      }
    }
    inputsRef.current[index]?.select();
  };

  return (
    <div className="code-input-wrapper" onPaste={handlePaste}>
      {Array.from({ length: DIGITS }, (_, i) => (
        <input
          key={i}
          type="text"
          inputMode="numeric"
          pattern="[0-9]"
          maxLength={1}
          className="code-input-cell"
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          id={i === 0 ? id : undefined}
          name={id ? `${id}-digit-${i}` : undefined}
          onChange={() => handleChange(i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onFocus={() => handleFocus(i)}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
};

export default React.memo(CodeInput);
