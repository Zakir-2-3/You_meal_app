"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

import { LottieIcon } from "@/components/ui/LottieIcon";

import { useTranslate } from "@/hooks/app/useTranslate";

import { validRoutes } from "@/constants/user/validRoutes";

import footerLogo from "@/assets/images/footer-logo.png";
import socialIcon_1 from "@/assets/icons/socialIcon_1.svg?url";
import socialIcon_2 from "@/assets/icons/socialIcon_2.svg?url";
import socialIcon_3 from "@/assets/icons/socialIcon_3.svg?url";
import phoneAnimation from "@/assets/animations/phone_animation.json";

import "./Footer.scss";

const Footer = () => {
  const [hovered, setHovered] = useState(false);
  const [isLogoNavigating, setIsLogoNavigating] = useState(false);
  const [isPhoneNavigating, setIsPhoneNavigating] = useState(false);

  const pathname = usePathname();

  const { isAuth } = useSelector((state: RootState) => state.user);

  const { t } = useTranslate();

  const { design, rights, orderNumber, socialNetworks } = t.footer;

  // Сброс блокировки логотипа при смене пути
  useEffect(() => {
    setIsLogoNavigating(false);
  }, [pathname]);

  // Таймаут-подстраховка для логотипа
  useEffect(() => {
    if (isLogoNavigating) {
      const timer = setTimeout(() => setIsLogoNavigating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isLogoNavigating]);

  // Сброс блокировки телефона через 1.5 секунды
  useEffect(() => {
    if (isPhoneNavigating) {
      const timer = setTimeout(() => setIsPhoneNavigating(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isPhoneNavigating]);

  // Проверяем, нужно ли скрывать footer
  const isHidden =
    !validRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    ) ||
    (pathname === "/user" && !isAuth);

  if (isHidden) return null;

  const isProductPage = pathname.startsWith("/product/");

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/" || isLogoNavigating) {
      e.preventDefault();
      return;
    }
    setIsLogoNavigating(true);
  };

  const handlePhoneClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isPhoneNavigating) {
      e.preventDefault();
      return;
    }
    setIsPhoneNavigating(true);
  };

  return (
    <footer className={`footer ${isProductPage ? "footer-product" : ""}`}>
      <div className="container footer-container">
        <div className="footer__logo">
          <Link href="/" onClick={handleLogoClick}>
            <Image src={footerLogo} alt="footer-logo" width={305} height={68} />
          </Link>
        </div>
        <div className="footer__number">
          <p>{orderNumber}</p>
          <Link
            className="footer__number-link"
            href="tel:+79333333911"
            onClick={handlePhoneClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <LottieIcon
              trigger="hover+load"
              isHovered={hovered}
              animationData={phoneAnimation}
              size={24}
            />
            +7 (933) 333-39-11
          </Link>
        </div>
        <div className="footer__social">
          <p>{socialNetworks}</p>
          <ul className="footer__social-list">
            <li className="footer__social-item">
              <Link href={"https://x.com/"} target="_blank">
                <img
                  src={socialIcon_1}
                  alt="socialIcon_1"
                  width={24}
                  height={24}
                />
              </Link>
            </li>
            <li className="footer__social-item">
              <Link href={"https://www.instagram.com/"} target="_blank">
                <img
                  src={socialIcon_2}
                  alt="socialIcon_2"
                  width={24}
                  height={24}
                />
              </Link>
            </li>
            <li className="footer__social-item">
              <Link href={"https://www.facebook.com/"} target="_blank">
                <img
                  src={socialIcon_3}
                  alt="socialIcon_3"
                  width={32}
                  height={32}
                />
              </Link>
            </li>
          </ul>
        </div>
        <div className="footer__copyright">
          <p>
            © YouMeal {new Date().getFullYear()}. {rights}
          </p>
          <p>{design} Anastasia Ilina</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
