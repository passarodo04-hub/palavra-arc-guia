import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ThemeMode = "light" | "dark" | "system";
const KEY = "theme-mode";
const Ctx = createContext<{ theme: ThemeMode; setTheme: (t: ThemeMode) => void; resolved: "light" | "dark" }>({
  theme: "light",
  setTheme: () => {},
  resolved: "light",
});

function applyTheme(mode: ThemeMode): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  const sys = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  const resolved: "light" | "dark" = mode === "system" ? (sys ? "dark" : "light") : mode;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  return resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    let initial: ThemeMode = "light";
    try {
      const v = localStorage.getItem(KEY) as ThemeMode | null;
      if (v === "light" || v === "dark" || v === "system") initial = v;
    } catch {}
    setThemeState(initial);
    setResolved(applyTheme(initial));
  }, []);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setResolved(applyTheme("system"));
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
    setResolved(applyTheme(t));
    try { localStorage.setItem(KEY, t); } catch {}
  };

  return <Ctx.Provider value={{ theme, setTheme, resolved }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  return useContext(Ctx);
}