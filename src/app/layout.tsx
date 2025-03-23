import { Nunito } from "next/font/google";
import { Metadata } from "next";

import { ReduxProvider } from "@/store/Providers";

import Header from "@/components/Header/Header";
import RegistrationForm from "@/components/RegistrationForm/RegistrationForm";
import Footer from "@/components/Footer/Footer";

import "@/styles/reset.css";
import "@/styles/globals.scss";

const nunito = Nunito({
  weight: ["400", "600", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YourMeal",
  description: "Лучшие блюда в YourMeal!",
  icons: "/favicon.svg",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={nunito.className}>
        <ReduxProvider>
          <Header />
          <main className="main">{children}</main>
          <Footer />
          <RegistrationForm />
        </ReduxProvider>
      </body>
    </html>
  );
}
