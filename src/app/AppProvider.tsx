"use client";

import { ReduxProvider } from "@/store/Providers";
import PersistGateWrapper from "@/components/PersistGateWrapper/PersistGateWrapper";
import SessionProviderWrapper from "@/components/SessionProviderWrapper/SessionProviderWrapper";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReduxProvider>
      <PersistGateWrapper>
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </PersistGateWrapper>
    </ReduxProvider>
  );
}
