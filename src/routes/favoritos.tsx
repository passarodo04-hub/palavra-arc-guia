import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { BottomNav } from "@/components/BottomNav";
import { useLocalStorage } from "@/lib/storage";
import { getBook, loadChapter, type Translation } from "@/lib/bible-data";
import { loadHymn } from "@/lib/harpa-data";
import { useState } from "react";
import { useBibleHighlights, COLOR_LABELS } from "@/lib/bible-highlights";
import { HighlightPicker } from "@/components/bible/HighlightPicker";
import { Button } from "@/components/ui/button";
import { Highlighter } from "lucide-react";
import { useTranslation } from "@/lib/translation-context";

export const Route = createFileRoute("/favoritos")({ component: FavPage, head: () => ({ meta: [
  { title: "Meus Favoritos e Marca-textos | Palavra+" },
  { name: "description", content: "Versículos, hinos e marca-textos salvos na sua Bíblia." },
  { property: "og:title", content: "Meus Favoritos e Marca-textos | Palavra+" },
  { property: "og:description", content: "Versículos, hinos e marca-textos salvos na sua Bíblia." },
  { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
] }) });

function FavPage() {
  const [favVerses] = useLocalStorage<string[]>("fav-verses", []);
  const [favHymns] = useLocalStorage<number[]>("fav-hymns", []);
  const [tab, setTab] = useState<"verses" | "hymns" | "highlights">("verses");
  const { items: highlights, setHighlight, busy, error } = useBibleHighlights();
  const { setTranslation } = useTranslation();

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
  const markedChapters = Array.from(new Set(highlights.filter((h) => h.verse !== null).map((h) => `${h.translation}|${h.book}|${h.chapter}`)));
  const markedQueries = useQueries({ queries: markedChapters.map((key) => {
    const [tr, book, ch] = key.split("|");
    return { queryKey: ["chapter", tr, book, Number(ch)], queryFn: () => loadChapter(book, Number(ch), tr as Translation), staleTime: Infinity };
  }) });
  const markedMap = new Map(markedChapters.map((key, i) => [key, markedQueries[i].data]));

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-gradient-spiritual text-primary-foreground px-6 py-8">
        <h1 className="font-serif text-3xl">Meus Favoritos</h1>
        <p className="text-sm text-primary-foreground/70">Guardados no coração</p>
      </header>
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <div className="flex flex-wrap gap-2 bg-secondary p-1 w-fit rounded-md" role="tablist" aria-label="Meus Favoritos">
          {(["verses", "hymns", "highlights"] as const).map((t) => (
            <Button variant="ghost" size="sm" role="tab" aria-selected={tab === t}
              key={t}
              onClick={() => setTab(t)}
              className={`${tab === t ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"}`}
            >
              {t === "verses" ? `Favoritos · Versículos (${favVerses.length})` : t === "hymns" ? `Hinos (${favHymns.length})` : `Marca-textos (${highlights.length})`}
            </Button>
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
          {tab === "highlights" && <section role="tabpanel" aria-label="Marca-textos" className="space-y-3">
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            {!highlights.length && !busy && <p className="text-center text-muted-foreground py-12 font-serif text-lg">Você ainda não marcou nenhum versículo ou capítulo.</p>}
            {highlights.map((h) => {
              const text = h.verse === null ? null : markedMap.get(`${h.translation}|${h.book}|${h.chapter}`)?.verses.find((v) => v.verse === h.verse)?.text;
              return <article key={`${h.translation}:${h.book}:${h.chapter}:${h.verse ?? "chapter"}`} className="rounded-md border border-border bg-card p-4 sm:p-5">
                <div className="flex min-w-0 items-start gap-2">
                  <span className={`mt-1 size-4 shrink-0 rounded-sm highlight-swatch-${h.color}`} title={COLOR_LABELS[h.color]} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-foreground">{getBook(h.book)?.name ?? h.book} {h.chapter}{h.verse !== null ? `:${h.verse}` : " · capítulo inteiro"} <span className="text-muted-foreground font-normal uppercase">— {h.translation}</span></div>
                    {text && <p className="mt-2 font-serif text-lg leading-relaxed line-clamp-3">{text}</p>}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button variant="outline" size="sm" asChild onClick={() => setTranslation(h.translation)}>
                        <Link to="/biblia/$book/$chapter" params={{ book: h.book, chapter: String(h.chapter) }} search={h.verse !== null ? { v: h.verse } : {}}>Abrir na Bíblia</Link>
                      </Button>
                      <details className="group"><summary className="list-none cursor-pointer inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs hover:bg-accent"><Highlighter className="size-4" /> {COLOR_LABELS[h.color]} · alterar</summary>
                        <div className="mt-2"><HighlightPicker color={h.color} disabled={busy} onChange={(color) => void setHighlight({ translation: h.translation, book: h.book, chapter: h.chapter, verse: h.verse }, color)} /></div>
                      </details>
                      <Button variant="ghost" size="sm" disabled={busy} onClick={() => void setHighlight({ translation: h.translation, book: h.book, chapter: h.chapter, verse: h.verse }, null)}>Remover</Button>
                    </div>
                  </div>
                </div>
              </article>;
            })}
          </section>}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
