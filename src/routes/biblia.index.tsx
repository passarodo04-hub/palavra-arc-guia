import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { bibleBooks, TRANSLATIONS, type Translation } from "@/lib/bible-data";
import { useTranslation } from "@/lib/translation-context";
import { useState } from "react";
import { Check, BookMarked } from "lucide-react";

export const Route = createFileRoute("/biblia/")({ component: BibliaPage });

function BibliaPage() {
  const [tab, setTab] = useState<"old" | "new">("old");
  const [query, setQuery] = useState("");
  const { translation, setTranslation } = useTranslation();
  const [pending, setPending] = useState<Translation | null>(null);
  const books = bibleBooks.filter(
    (b) => b.testament === tab && b.name.toLowerCase().includes(query.toLowerCase()),
  );
  const current = TRANSLATIONS.find((t) => t.id === translation)!;
  const requestSwitch = (t: Translation) => {
    if (t === translation) return;
    setPending(t);
  };
  const confirmSwitch = () => {
    if (pending) setTranslation(pending);
    setPending(null);
  };
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-gradient-spiritual text-primary-foreground px-6 py-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl">Bíblia Sagrada</h1>
            <p className="text-sm text-primary-foreground/70">{current.full}</p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-white/10 p-1">
            {TRANSLATIONS.map((t) => (
              <button
                key={t.id}
                onClick={() => requestSwitch(t.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition ${
                  translation === t.id
                    ? "bg-gold text-gold-foreground"
                    : "text-primary-foreground/80 hover:text-primary-foreground"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <div className="flex gap-2 rounded-full bg-secondary p-1 w-fit">
          {(["old", "new"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-sm rounded-full transition ${tab === t ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"}`}
            >
              {t === "old" ? "Antigo Testamento" : "Novo Testamento"}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filtrar livro..."
          className="mt-4 w-full rounded-full bg-secondary px-5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold"
        />
        <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-2">
          {books.map((b) => (
            <Link
              key={b.id}
              to="/biblia/$book"
              params={{ book: b.id }}
              className="group rounded-xl border border-border bg-card p-4 hover:border-gold/40 transition"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-base text-card-foreground">{b.name}</span>
                <span className="text-[10px] text-muted-foreground">{b.chapters} cap.</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {pending && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-up"
          onClick={() => setPending(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-card border border-border p-6 shadow-soft"
          >
            <div className="size-12 rounded-2xl bg-gradient-spiritual flex items-center justify-center text-gold">
              <BookMarked className="size-5" />
            </div>
            <h2 className="mt-4 font-serif text-xl text-card-foreground">
              Trocar tradução para {pending.toUpperCase()}?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Esta é uma tradução diferente da Bíblia. Todos os livros, capítulos e versículos
              serão exibidos em <strong>{TRANSLATIONS.find((t) => t.id === pending)?.full}</strong>.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setPending(null)}
                className="flex-1 rounded-full border border-border bg-background py-2.5 text-sm font-medium text-foreground"
              >
                Não
              </button>
              <button
                onClick={confirmSwitch}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
              >
                <Check className="size-4" /> Sim, trocar
              </button>
            </div>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}
