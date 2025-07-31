import { Nunito } from "next/font/google";
import { Metadata } from "next";

import AppProvider from "./AppProvider";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "@/components/Header/Header";
import RegistrationForm from "@/components/auth/RegistrationForm/RegistrationForm";
import Footer from "@/components/Footer/Footer";

import "@/styles/reset.css";
import "@/styles/globals.scss";
import "@/styles/toastify.scss";

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
        <AppProvider>
          <Header />
          <main className="main">{children}</main>
          <Footer />
          <RegistrationForm />
          <ToastContainer
            position="top-right" // Позиция тостов
            autoClose={2500} // Автозакрытие через 2.5 секунды
            hideProgressBar={false} // Показывать прогресс-бар
            newestOnTop={false} // Новые тосты снизу
            closeOnClick // Закрывать по клику
            rtl={false} // Направление текста (слева направо)
            pauseOnFocusLoss // Пауза при потере фокуса
            draggable // Возможность перетаскивать тосты
            pauseOnHover // Пауза при наведении
          />
        </AppProvider>
      </body>
    </html>
  );
}
