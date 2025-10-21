"use client";

import React, { useEffect, useState } from "react";

import Image from "next/image";

import { useTranslate } from "@/hooks/useTranslate";

import scrollToTop from "@/assets/icons/scroll-to-top.svg";

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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      <Image src={scrollToTop} alt="scroll-to-top" width={40} height={30} />
    </button>
  );
}
