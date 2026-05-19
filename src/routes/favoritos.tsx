import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { BottomNav } from "@/components/BottomNav";
import { useLocalStorage } from "@/lib/storage";
import { getBook, loadChapter } from "@/lib/bible-data";
import { loadHymn } from "@/lib/harpa-data";
import { useState } from "react";

export const Route = createFileRoute("/favoritos")({ component: FavPage });

function FavPage() {
  const [favVerses] = useLocalStorage<string[]>("fav-verses", []);
  const [favHymns] = useLocalStorage<number[]>("fav-hymns", []);
  const [tab, setTab] = useState<"verses" | "hymns">("verses");

  // Group verse favorites by chapter for efficient loading
  const chapterKeys = Array.from(new Set(favVerses.map((k) => {
    const [book, ch] = k.split("-");
    return `${book}|${ch}`;
  })));

  const chapterQueries = useQueries({
    queries: chapterKeys.map((key) => {
      const [book, ch] = key.split("|");
      return {
        queryKey: ["chapter", book, parseInt(ch, 10)],
        queryFn: () => loadChapter(book, parseInt(ch, 10)),
        staleTime: Infinity,
      };
    }),
  });
  const chapterMap = new Map<string, Awaited<ReturnType<typeof loadChapter>>>();
  chapterKeys.forEach((k, i) => chapterMap.set(k, chapterQueries[i].data ?? null));

  const hymnQueries = useQueries({
    queries: favHymns.map((id) => ({
      queryKey: ["hymn", id],
      queryFn: () => loadHymn(id),
      staleTime: Infinity,
    })),
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-gradient-spiritual text-primary-foreground px-6 py-8">
        <h1 className="font-serif text-3xl">Favoritos</h1>
        <p className="text-sm text-primary-foreground/70">Guardados no coração</p>
      </header>
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <div className="flex gap-2 rounded-full bg-secondary p-1 w-fit">
          {(["verses", "hymns"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-sm rounded-full transition ${tab === t ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"}`}
            >
              {t === "verses" ? `Versículos (${favVerses.length})` : `Hinos (${favHymns.length})`}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {tab === "verses" && (
            favVerses.length === 0 ? (
              <p className="text-center text-muted-foreground py-12 font-serif text-lg">Você ainda não favoritou nenhum versículo.</p>
            ) : (
              favVerses.map((key) => {
                const [book, ch, v] = key.split("-");
                const chapter = chapterMap.get(`${book}|${ch}`);
                const verse = chapter?.verses.find((x) => x.verse === parseInt(v, 10));
                const b = getBook(book);
                if (!verse) return null;
                return (
                  <Link key={key} to="/biblia/$book/$chapter" params={{ book, chapter: ch }} className="block rounded-xl border border-border bg-card p-5">
                    <div className="text-xs text-gold">{b?.name} {ch}:{v}</div>
                    <p className="mt-2 font-serif text-lg leading-relaxed">"{verse.text}"</p>
                  </Link>
                );
              })
            )
          )}
          {tab === "hymns" && (
            favHymns.length === 0 ? (
              <p className="text-center text-muted-foreground py-12 font-serif text-lg">Você ainda não favoritou nenhum hino.</p>
            ) : (
              favHymns.map((id, i) => {
                const h = hymnQueries[i].data;
                if (!h) return null;
                return (
                  <Link key={id} to="/harpa/$id" params={{ id: String(id) }} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                    <div className="font-serif text-2xl text-gold w-12 text-center tabular-nums">{h.id}</div>
                    <div className="font-serif text-lg text-card-foreground">{h.title}</div>
                  </Link>
                );
              })
            )
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
