"use client";

import { ReactNode, useEffect, useState } from "react";

import { PersistGate } from "redux-persist/integration/react";

import { persistor } from "@/store/store";

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
