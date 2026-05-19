import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { useState } from "react";
import { searchVerses, getBook } from "@/lib/bible-data";
import { searchHymns } from "@/lib/harpa-data";
import { Search } from "lucide-react";

export const Route = createFileRoute("/busca")({ component: SearchPage });

function SearchPage() {
  const [q, setQ] = useState("");
  const verses = q.length > 1 ? searchVerses(q).slice(0, 20) : [];
  const hymnResults = q.length > 1 ? searchHymns(q).slice(0, 10) : [];
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-gradient-spiritual text-primary-foreground px-6 py-8">
        <h1 className="font-serif text-3xl">Buscar</h1>
      </header>
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar versículo, hino, palavra-chave..." className="w-full rounded-full bg-secondary pl-11 pr-5 py-3 text-sm outline-none focus:ring-2 focus:ring-gold" />
        </div>
        {verses.length > 0 && (
          <section className="mt-6">
            <h2 className="text-xs uppercase tracking-widest text-gold mb-3">Versículos</h2>
            <ul className="space-y-2">
              {verses.map((v, i) => (
                <li key={i}>
                  <Link to="/biblia/$book/$chapter" params={{ book: v.book, chapter: String(v.chapter) }} className="block rounded-xl border border-border bg-card p-4">
                    <div className="text-xs text-gold">{getBook(v.book)?.name} {v.chapter}:{v.verse}</div>
                    <p className="font-serif mt-1">"{v.text}"</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {hymnResults.length > 0 && (
          <section className="mt-6">
            <h2 className="text-xs uppercase tracking-widest text-gold mb-3">Hinos</h2>
            <ul className="space-y-2">
              {hymnResults.map((h) => (
                <li key={h.id}>
                  <Link to="/harpa/$id" params={{ id: String(h.id) }} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                    <span className="font-serif text-gold text-xl w-10 text-center">{h.id}</span>
                    <span className="font-serif">{h.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      <BottomNav />
    </div>
  );
}