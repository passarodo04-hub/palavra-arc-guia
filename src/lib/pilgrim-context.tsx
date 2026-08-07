import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/* Modo Peregrino — só muda a interface. Não apaga nada, não altera dados,
 * não interfere em XP, streak, jornadas ou sincronização. */

const KEY = "palavra-plus:pilgrim";

type PilgrimContextValue = {
  active: boolean;
  entering: boolean;
  enter: () => void;
  exit: () => void;
};

const PilgrimContext = createContext<PilgrimContextValue>({
  active: false,
  entering: false,
  enter: () => {},
  exit: () => {},
});

export function PilgrimProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    try {
      setActive(window.localStorage.getItem(KEY) === "1");
    } catch {}
  }, []);

  const enter = useCallback(() => {
    setEntering(true);
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {}
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(
      () => {
        setActive(true);
        setEntering(false);
      },
      reduced ? 200 : 1600,
    );
  }, []);

  const exit = useCallback(() => {
    try {
      window.localStorage.removeItem(KEY);
    } catch {}
    setActive(false);
    setEntering(false);
  }, []);

  const value = useMemo(() => ({ active, entering, enter, exit }), [active, entering, enter, exit]);

  return (
    <PilgrimContext.Provider value={value}>
      {children}
      {entering && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm animate-fade-in"
          role="status"
          aria-live="polite"
        >
          <p className="px-6 text-center font-serif text-2xl text-foreground md:text-3xl">
            Seu caminho continua.
          </p>
        </div>
      )}
    </PilgrimContext.Provider>
  );
}

export function usePilgrim() {
  return useContext(PilgrimContext);
}