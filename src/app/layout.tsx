import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

import { Nunito } from "next/font/google";

const nunito = Nunito({
  weight: ["400", "600", "800"],
  subsets: ["latin"],
});

import "@/styles/reset.css";
import "@/styles/globals.scss";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={nunito.className}>
        <Header />
        <main className="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
