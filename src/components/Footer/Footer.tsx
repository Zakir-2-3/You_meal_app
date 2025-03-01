"use client";

import { FC } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { validRoutes } from "@/constants/validRoutes";

import footerLogo from "@/assets/images/footer-logo.png";
import phoneIcon from "@/assets/icons/phone-icon.svg";
import socialIcon_1 from "@/assets/icons/socialIcon_1.svg";
import socialIcon_2 from "@/assets/icons/socialIcon_2.svg";
import socialIcon_3 from "@/assets/icons/socialIcon_3.svg";

import "./Footer.scss";

const Footer: FC = () => {
  const pathname = usePathname();

  // Если путь не найден в validRoutes, скрываем Footer
  const isHidden = !validRoutes.includes(pathname);

  return (
    <footer className={`footer ${isHidden ? "footer-hidden" : ""}`}>
      <div className="container footer-container">
        <div className="footer__logo">
          <Link href="/">
            <Image src={footerLogo} alt="footer-logo" width={305} height={68} />
          </Link>
        </div>
        <div className="footer__number">
          <p>Номер для заказа</p>
          <Link href="tel:+79308333811">
            <Image src={phoneIcon} alt="phone-icon" width={24} height={24} />
            +7 (930) 833-38-11
          </Link>
        </div>
        <div className="footer__social">
          <p>Мы в соцсетях</p>
          <ul className="footer__social-list">
            <li className="footer__social-item">
              <Link href={"https://x.com/"} target="_blank">
                <Image
                  src={socialIcon_1}
                  alt="socialIcon_1"
                  width={26}
                  height={26}
                />
              </Link>
            </li>
            <li className="footer__social-item">
              <Link href={"https://www.instagram.com/"} target="_blank">
                <Image
                  src={socialIcon_2}
                  alt="socialIcon_2"
                  width={24}
                  height={24}
                />
              </Link>
            </li>
            <li className="footer__social-item">
              <Link href={"https://www.facebook.com/"} target="_blank">
                <Image
                  src={socialIcon_3}
                  alt="socialIcon_3"
                  width={30}
                  height={30}
                />
              </Link>
            </li>
          </ul>
        </div>
        <div className="footer__copyright">
          <p>© YouMeal, 2022</p>
          <p>Design: Anastasia Ilina</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
