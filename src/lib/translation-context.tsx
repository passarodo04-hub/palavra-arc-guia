import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Translation } from "./bible-data";

type Ctx = { translation: Translation; setTranslation: (t: Translation) => void };
const TranslationContext = createContext<Ctx>({ translation: "arc", setTranslation: () => {} });

const KEY = "bible-translation";

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [translation, setT] = useState<Translation>("arc");
  useEffect(() => {
    try {
      const v = window.localStorage.getItem(KEY);
      if (v === "arc" || v === "nvi") setT(v);
    } catch {}
  }, []);
  const setTranslation = (t: Translation) => {
    setT(t);
    try {
      window.localStorage.setItem(KEY, t);
    } catch {}
  };
  return (
    <TranslationContext.Provider value={{ translation, setTranslation }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  return useContext(TranslationContext);
}