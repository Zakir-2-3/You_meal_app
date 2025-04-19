// "use client";

// import dynamic from "next/dynamic";
// import { useEffect, useState } from "react";
// import { persistor } from "@/store/store";

// // Динамически загружаем PersistGate
// const PersistGate = dynamic(
//   () =>
//     import("redux-persist/integration/react").then((mod) => mod.PersistGate),
//   {
//     ssr: false, // Отключаем SSR для этого компонента
//   }
// );

// const PersistGateWrapper = ({ children }: { children: React.ReactNode }) => {
//   const [isClient, setIsClient] = useState(false);

//   useEffect(() => {
//     // Отмечаем, что мы на клиенте
//     setIsClient(true);
//   }, []);

//   // Если на сервере — просто рендерим детей без PersistGate
//   if (!isClient || !persistor) {
//     return <>{children}</>;
//   }

//   return (
//     <PersistGate loading={null} persistor={persistor}>
//       {children}
//     </PersistGate>
//   );
// };

// export default PersistGateWrapper;

"use client";

import { PersistGate } from "redux-persist/integration/react";
import { persistor } from "@/store/store";
import { ReactNode, useEffect, useState } from "react";

export default function PersistGateWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // На сервере ничего не рендерим
  }

  return (
    <PersistGate loading={null} persistor={persistor}>
      {children}
    </PersistGate>
  );
}
