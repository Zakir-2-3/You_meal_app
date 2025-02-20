import Head from "next/head";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

import { ReduxProvider } from "@/store/Providers";

import { Nunito } from "next/font/google";

import "@/styles/reset.css";
import "@/styles/globals.scss";

const nunito = Nunito({
  weight: ["400", "600", "800"],
  subsets: ["latin"],
});

export const metadata = {
  title: "YourMeal",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <Head>
        <title>YourMeal</title>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <meta name="description" content="Лучшие блюда в YourMeal!" />
      </Head>
      <body className={nunito.className}>
        <ReduxProvider>
          <Header />
          <main className="main">{children}</main>
          <Footer />
        </ReduxProvider>
      </body>
    </html>
  );
}
