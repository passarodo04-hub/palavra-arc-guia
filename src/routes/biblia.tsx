import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { bibleBooks } from "@/lib/bible-data";
import { useState } from "react";

export const Route = createFileRoute("/biblia")({ component: BibliaPage });

function BibliaPage() {
  const [tab, setTab] = useState<"old" | "new">("old");
  const [query, setQuery] = useState("");
  const books = bibleBooks.filter(
    (b) => b.testament === tab && b.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-gradient-spiritual text-primary-foreground px-6 py-8">
        <h1 className="font-serif text-3xl">Bíblia Sagrada</h1>
        <p className="text-sm text-primary-foreground/70">Almeida Revista e Corrigida</p>
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
              to="/biblia/$book/$chapter"
              params={{ book: b.id, chapter: "1" }}
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
      <BottomNav />
    </div>
  );
}
