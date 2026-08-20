"use client";

import { createContext, useContext } from "react";
import { resolveEntityLabel, type ResolvedEntityLabel } from "@/lib/entity-label";

const EntityLabelContext = createContext<ResolvedEntityLabel | null>(null);

export function EntityLabelProvider({
  labelKey,
  children,
}: {
  labelKey: string | null | undefined;
  children: React.ReactNode;
}) {
  return (
    <EntityLabelContext.Provider value={resolveEntityLabel(labelKey)}>
      {children}
    </EntityLabelContext.Provider>
  );
}

export function useEntityLabel(): ResolvedEntityLabel {
  const ctx = useContext(EntityLabelContext);
  if (!ctx) {
    throw new Error("useEntityLabel must be used within an EntityLabelProvider");
  }
  return ctx;
}
