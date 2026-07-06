import { Link, useLocation } from "@tanstack/react-router";
import { BookOpen, Music, Sparkles, BookOpenCheck, Home, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Início", icon: Home },
  { to: "/biblia", label: "Bíblia", icon: BookOpen },
  { to: "/resumo", label: "Resumo", icon: BookOpenCheck },
  { to: "/harpa", label: "Harpa", icon: Music },
  { to: "/campanhas", label: "Campanhas", icon: Target },
  { to: "/estudos", label: "Estudos", icon: Sparkles },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/90 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-3xl items-center justify-around px-2 py-2">
        {items.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <li key={to}>
              <Link
                to={to}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-colors",
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