import Header from "@/components/Header/Header";

import "@/styles/reset.css";
import "@/styles/globals.scss";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <Header />
        <main className="main">{children}</main>
      </body>
    </html>
  );
}
