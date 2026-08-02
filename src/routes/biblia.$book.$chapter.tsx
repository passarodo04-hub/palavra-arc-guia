import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/BottomNav";
import { getBook, loadChapter } from "@/lib/bible-data";
import { useTranslation } from "@/lib/translation-context";
import { ChevronLeft, ChevronRight, Heart, List } from "lucide-react";
import { useLocalStorage } from "@/lib/storage";
import { useEffect, useRef, useState } from "react";
import { useBibleReads } from "@/hooks/use-bible-reads";

type Search = { v?: number };

export const Route = createFileRoute("/biblia/$book/$chapter")({
  component: ReaderPage,
  validateSearch: (s: Record<string, unknown>): Search => ({
    v: s.v != null ? Number(s.v) || undefined : undefined,
  }),
});

function ReaderPage() {
  const { book, chapter } = Route.useParams();
  const { v: targetVerse } = Route.useSearch();
  const chNum = parseInt(chapter, 10);
  const bookInfo = getBook(book);
  const [favs, setFavs] = useLocalStorage<string[]>("fav-verses", []);
  const [highlights, setHighlights] = useLocalStorage<string[]>("highlight-verses", []);
  const [fontSize, setFontSize] = useLocalStorage<number>("font-size", 18);
  const [verseInput, setVerseInput] = useState("");
  const { translation } = useTranslation();
  const { isRead, toggle } = useBibleReads();
  const chapterRead = isRead(book, chNum);
  const { data: ch, isLoading, error } = useQuery({
    queryKey: ["chapter", translation, book, chNum],
    queryFn: () => loadChapter(book, chNum, translation),
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: false,
  });
  const verseRefs = useRef<Record<number, HTMLParagraphElement | null>>({});
  useEffect(() => {
    if (!targetVerse || !ch) return;
    const el = verseRefs.current[targetVerse];
    if (el) {
      const t = setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 120);
      return () => clearTimeout(t);
    }
  }, [targetVerse, ch]);
  const toggleFav = (v: number) => {
    const key = `${book}-${chNum}-${v}`;
    setFavs(favs.includes(key) ? favs.filter((f) => f !== key) : [...favs, key]);
  };
  const toggleHl = (v: number) => {
    const key = `${book}-${chNum}-${v}`;
    setHighlights(highlights.includes(key) ? highlights.filter((f) => f !== key) : [...highlights, key]);
  };
  const totalCh = bookInfo?.chapters ?? 1;
  const prev = chNum > 1 ? chNum - 1 : null;
  const next = chNum < totalCh ? chNum + 1 : null;
  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <Link to="/biblia/$book" params={{ book }} className="text-sm text-muted-foreground inline-flex items-center gap-1">
          <List className="size-4" /> Capítulos
        </Link>
        <div className="font-serif text-base">
          {bookInfo?.name} {chNum} <span className="text-xs text-muted-foreground">/ {totalCh}</span>
          <span className="ml-2 text-[10px] uppercase tracking-widest text-gold">{translation}</span>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className="size-8 rounded-full bg-secondary text-xs">A-</button>
          <button onClick={() => setFontSize(Math.min(28, fontSize + 2))} className="size-8 rounded-full bg-secondary text-sm">A+</button>
        </div>
      </header>
      <article className="mx-auto max-w-2xl px-6 py-8">
        {ch && ch.verses.length > 0 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const n = parseInt(verseInput, 10);
              if (n >= 1 && n <= ch.verses.length) {
                const el = verseRefs.current[n];
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
                el?.classList.add("ring-2", "ring-gold/60", "bg-gold/10");
                setTimeout(() => el?.classList.remove("ring-2", "ring-gold/60", "bg-gold/10"), 2000);
              }
            }}
            className="mb-6 flex items-center gap-2"
          >
            <input
              value={verseInput}
              onChange={(e) => setVerseInput(e.target.value)}
              inputMode="numeric"
              placeholder={`Ir para versículo (1–${ch.verses.length})`}
              className="flex-1 rounded-full bg-secondary px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-gold"
            />
            <button type="submit" className="rounded-full bg-gold px-4 py-2 text-xs font-semibold text-gold-foreground">Ir</button>
          </form>
        )}
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-5 bg-secondary rounded" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Esta tradução ({translation.toUpperCase()}) ainda não está disponível para este livro.
            <div className="mt-2 text-xs">Volte para Bíblia e selecione outra tradução.</div>
          </div>
        ) : ch ? (
          <div className="space-y-4">
            {ch.verses.map((v) => {
              const key = `${book}-${chNum}-${v.verse}`;
              const isFav = favs.includes(key);
              const isHl = highlights.includes(key);
              const isTarget = targetVerse === v.verse;
              return (
                <p
                  key={v.verse}
                  ref={(el) => { verseRefs.current[v.verse] = el; }}
                  className={`font-serif leading-relaxed text-card-foreground group rounded-md transition px-2 -mx-2 ${isHl ? "bg-gold/10" : ""} ${isTarget ? "bg-gold/15 ring-2 ring-gold/40" : ""}`}
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <sup className="mr-1.5 text-xs font-sans font-bold text-gold">{v.verse}</sup>
                  <span onDoubleClick={() => toggleHl(v.verse)}>{v.text}</span>
                  <button onClick={() => toggleFav(v.verse)} className="ml-2 opacity-60 hover:opacity-100 transition" aria-label="Favoritar">
                    <Heart className={`inline size-3.5 ${isFav ? "fill-gold text-gold" : "text-muted-foreground"}`} />
                  </button>
                </p>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12 font-serif">Capítulo não encontrado.</p>
        )}
        <nav className="mt-12 flex justify-between">
          {prev ? (
            <Link to="/biblia/$book/$chapter" params={{ book, chapter: String(prev) }} className="inline-flex items-center gap-1 text-sm text-primary">
              <ChevronLeft className="size-4" /> Cap. {prev}
            </Link>
          ) : <span />}
          <Link to="/biblia/$book" params={{ book }} className="text-sm text-muted-foreground">Todos os capítulos</Link>
          {next && (
            <Link to="/biblia/$book/$chapter" params={{ book, chapter: String(next) }} className="inline-flex items-center gap-1 text-sm text-primary ml-auto">
              Cap. {next} <ChevronRight className="size-4" />
            </Link>
          )}
        </nav>
      </article>
      <BottomNav />
    </div>
  );
}
