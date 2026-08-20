"use client";

import { createContext, useContext } from "react";
import { resolveSessionLabel, type ResolvedSessionLabel } from "@/lib/session-label";

const SessionLabelContext = createContext<ResolvedSessionLabel | null>(null);

export function SessionLabelProvider({
  labelKey,
  children,
}: {
  labelKey: string | null | undefined;
  children: React.ReactNode;
}) {
  return (
    <SessionLabelContext.Provider value={resolveSessionLabel(labelKey)}>
      {children}
    </SessionLabelContext.Provider>
  );
}

export function useSessionLabel(): ResolvedSessionLabel {
  const ctx = useContext(SessionLabelContext);
  if (!ctx) {
    throw new Error("useSessionLabel must be used within a SessionLabelProvider");
  }
  return ctx;
}
