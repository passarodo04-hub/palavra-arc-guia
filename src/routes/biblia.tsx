import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { bibleBooks, sampleChapters } from "@/lib/bible-data";
import { useState } from "react";

export const Route = createFileRoute("/biblia")({ component: BibliaPage });

function BibliaPage() {
  const [tab, setTab] = useState<"old" | "new">("old");
  const books = bibleBooks.filter((b) => b.testament === tab);
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-gradient-spiritual text-primary-foreground px-6 py-8">
        <h1 className="font-serif text-3xl">Bíblia Sagrada</h1>
        <p className="text-sm text-primary-foreground/70">Almeida Revista e Corrigida</p>
      </header>
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <div className="flex gap-2 rounded-full bg-secondary p-1 w-fit">
          {(["old", "new"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 text-sm rounded-full transition ${tab === t ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"}`}>
              {t === "old" ? "Antigo Testamento" : "Novo Testamento"}
            </button>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-2">
          {books.map((b) => {
            const hasContent = !!sampleChapters[b.id];
            return (
              <Link
                key={b.id}
                to="/biblia/$book/$chapter"
                params={{ book: b.id, chapter: String(sampleChapters[b.id]?.[0]?.chapter ?? 1) }}
                className="group rounded-xl border border-border bg-card p-4 hover:border-gold/40 transition"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-base text-card-foreground">{b.name}</span>
                  <span className="text-[10px] text-muted-foreground">{b.chapters} cap.</span>
                </div>
                {hasContent && <span className="text-[10px] text-gold">Disponível</span>}
              </Link>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}