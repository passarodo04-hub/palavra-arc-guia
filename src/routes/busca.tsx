import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/BottomNav";
import { useDeferredValue, useState } from "react";
import { searchVerses, getBook } from "@/lib/bible-data";
import { searchHymns } from "@/lib/harpa-data";
import { searchAtlas, atlasHref } from "@/lib/atlas-search";
import { Search, Loader2 } from "lucide-react";

export const Route = createFileRoute("/busca")({ component: SearchPage });

function SearchPage() {
  const [q, setQ] = useState("");
  const deferred = useDeferredValue(q);
  const enabled = deferred.trim().length > 1;
  const { data: verses = [], isFetching: vLoading } = useQuery({
    queryKey: ["search-verses", deferred],
    queryFn: () => searchVerses(deferred, 30),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
  const { data: hymnResults = [], isFetching: hLoading } = useQuery({
    queryKey: ["search-hymns", deferred],
    queryFn: () => searchHymns(deferred, 15),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
  const loading = enabled && (vLoading || hLoading);
  const atlas = enabled ? searchAtlas(deferred, 12) : [];
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-gradient-spiritual text-primary-foreground px-6 py-8">
        <h1 className="font-serif text-3xl">Buscar</h1>
        <p className="text-sm text-primary-foreground/70">Versículos e hinos</p>
      </header>
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar versículo, hino, palavra-chave..."
            className="w-full rounded-full bg-secondary pl-11 pr-12 py-3 text-sm outline-none focus:ring-2 focus:ring-gold"
          />
          {loading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-gold animate-spin" />
          )}
        </div>
        {atlas.length > 0 && (
          <section className="mt-6">
            <h2 className="text-xs uppercase tracking-widest text-gold mb-3">
              Atlas Bíblico ({atlas.length})
            </h2>
            <ul className="space-y-2">
              {atlas.map((a) => (
                <li key={`${a.kind}-${a.id}`}>
                  <Link
                    to={atlasHref(a)}
                    className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-gold/40"
                  >
                    <div className="text-xs text-gold">{a.subtitle}</div>
                    <p className="font-serif mt-1">{a.name}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {verses.length > 0 && (
          <section className="mt-6">
            <h2 className="text-xs uppercase tracking-widest text-gold mb-3">Versículos ({verses.length})</h2>
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
            <h2 className="text-xs uppercase tracking-widest text-gold mb-3">Hinos ({hymnResults.length})</h2>
            <ul className="space-y-2">
              {hymnResults.map((h) => (
                <li key={h.id}>
                  <Link to="/harpa/$id" params={{ id: String(h.id) }} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                    <span className="font-serif text-gold text-xl w-10 text-center tabular-nums">{h.id}</span>
                    <span className="font-serif">{h.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {enabled && !loading && verses.length === 0 && hymnResults.length === 0 && atlas.length === 0 && (
          <p className="mt-10 text-center text-muted-foreground font-serif">Nenhum resultado para "{deferred}".</p>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
