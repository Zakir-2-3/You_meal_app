"use client";

import React, { useEffect, useState } from "react";

import { useTranslate } from "@/hooks/app/useTranslate";

import scrollToTop from "@/assets/icons/scroll-to-top.svg?url";

import "./ScrollToTop.scss";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  const THRESHOLD = 1000; // отображение кнопки после 1000px

  const { t } = useTranslate();

  const { scrollToTopTr } = t.buttons;

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > THRESHOLD);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    const start = window.scrollY;
    const duration = 800;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      window.scrollTo(0, start * (1 - ease));
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      className={`scroll-to-top ${visible ? "scroll-to-top--visible" : ""}`}
      onClick={handleClick}
      onKeyDown={handleKey}
      aria-label="Scroll to top"
      title={scrollToTopTr}
    >
      <img src={scrollToTop} alt="scroll-to-top" width={40} height={30} />
    </button>
  );
}
