import { useEffect, useState } from "react";

const KEY = "palavra-plus:jornadas-intro";

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * Short premium entry animation for the Jornadas area.
 * Shows once per browser session and is skipped entirely when the user
 * prefers reduced motion.
 */
export function JourneyIntro() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(KEY) === "1";
    } catch {}
    if (seen) return;
    try {
      window.sessionStorage.setItem(KEY, "1");
    } catch {}
    setVisible(true);
    const t1 = window.setTimeout(() => setLeaving(true), 750);
    const t2 = window.setTimeout(() => setVisible(false), 1150);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-hero ${
        leaving ? "animate-intro-out" : ""
      }`}
    >
      <div className="animate-intro-word text-center">
        <div className="font-serif text-4xl sm:text-6xl md:text-7xl tracking-[0.2em] text-hero-foreground">
          JORNADAS
        </div>
        <div className="mx-auto mt-4 h-px w-24 bg-hero-accent/70" />
        <div className="mt-3 text-[10px] uppercase tracking-[0.35em] text-hero-accent">Palavra+</div>
      </div>
    </div>
  );
}
