import { createContext, useContext, type ReactNode } from "react";

import { usePigeonController } from "../hooks/use-pigeon-controller";
import type { PigeonContextValue } from "../lib/types";

const PigeonContext = createContext<PigeonContextValue | null>(null);

export function PigeonProvider({ children }: { children: ReactNode }) {
  const value = usePigeonController();
  return (
    <PigeonContext.Provider value={value}>{children}</PigeonContext.Provider>
  );
}

export function usePigeon(): PigeonContextValue {
  const ctx = useContext(PigeonContext);
  if (!ctx) {
    throw new Error("usePigeon deve ser usado dentro de <PigeonProvider>");
  }
  return ctx;
}
