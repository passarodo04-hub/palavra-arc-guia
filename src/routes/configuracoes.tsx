import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { useEffect } from "react";
import { useLocalStorage } from "@/lib/storage";
import { Moon, Sun } from "lucide-react";

export const Route = createFileRoute("/configuracoes")({ component: SettingsPage });

function SettingsPage() {
  const [dark, setDark] = useLocalStorage<boolean>("dark-mode", false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-gradient-spiritual text-primary-foreground px-6 py-8">
        <h1 className="font-serif text-3xl">Configurações</h1>
      </header>
      <div className="mx-auto max-w-3xl px-4 pt-6 space-y-3">
        <button onClick={() => setDark(!dark)} className="w-full flex items-center justify-between rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            {dark ? <Moon className="size-5 text-gold" /> : <Sun className="size-5 text-gold" />}
            <span className="font-serif text-lg">Modo {dark ? "escuro" : "claro"}</span>
          </div>
          <div className={`h-6 w-11 rounded-full transition ${dark ? "bg-gold" : "bg-muted"}`}>
            <div className={`size-5 rounded-full bg-white mt-0.5 transition ${dark ? "ml-5" : "ml-0.5"}`} />
          </div>
        </button>
        <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          <p className="font-serif text-base text-foreground">Sobre o app</p>
          <p className="mt-2">Palavra+ — Bíblia (ARC e NVI), Harpa Cristã, devocionais diários e ferramentas de estudo.</p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}