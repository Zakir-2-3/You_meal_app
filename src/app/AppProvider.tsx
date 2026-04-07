"use client";

import { ReduxProvider } from "@/store/Providers";

import PersistGateWrapper from "@/components/shared/PersistGateWrapper/PersistGateWrapper";
import SessionProviderWrapper from "@/components/user/session/SessionProviderWrapper/SessionProviderWrapper";

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
