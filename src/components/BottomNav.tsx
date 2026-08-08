import { Link, useLocation } from "@tanstack/react-router";
import { BookOpen, Music, Sparkles, BookOpenCheck, Home, Target, Footprints, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePilgrim } from "@/lib/pilgrim-context";

const items = [
  { to: "/", label: "Início", icon: Home },
  { to: "/biblia", label: "Bíblia", icon: BookOpen },
  { to: "/resumo", label: "Resumo", icon: BookOpenCheck },
  { to: "/harpa", label: "Harpa", icon: Music },
  { to: "/campanhas", label: "Jornadas", icon: Target },
  { to: "/caminhada", label: "Caminhada", icon: Footprints },
  { to: "/estudos", label: "Estudos", icon: Sparkles },
] as const;

/* Modo Peregrino: mesma navegação, apenas mais enxuta. Nada é removido do app. */
const pilgrimItems = [
  { to: "/", label: "Início", icon: Home },
  { to: "/biblia", label: "Bíblia", icon: BookOpen },
  { to: "/harpa", label: "Harpa", icon: Music },
  { to: "/peregrino", label: "Peregrino", icon: Compass },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  const { active } = usePilgrim();
  const list = active ? pilgrimItems : items;
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/90 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-3xl items-center justify-around px-1 py-2">
        {list.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <li key={to}>
              <Link
                to={to}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors",
                  active ? "text-gold" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-5" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}