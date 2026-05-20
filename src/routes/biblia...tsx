import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/BottomNav";
import { getBook, loadChapter } from "@/lib/bible-data";
import { ChevronLeft, ChevronRight, Heart, List } from "lucide-react";
import { useLocalStorage } from "@/lib/storage";
import { useEffect, useRef, useState } from "react";

type Search = { v?: number };

export const Route = createFileRoute("/biblia/")({
  component: ReaderPage,
  validateSearch: (s: Record<string, unknown>): Search => ({
    v: s.v != null ? Number(s.v) || undefined : undefined,
  }),
});

function ReaderPage() {
  const { book, chapter } = Route.useParams();
  const { v: targetVerse } = Route.useSearch();
  const navigate = useNavigate();
  const chNum = parseInt(chapter, 10);
  const bookInfo = getBook(book);
  const [favs, setFavs] = useLocalStorage<string[]>("fav-verses", []);
  const [highlights, setHighlights] = useLocalStorage<string[]>("highlight-verses", []);
  const [fontSize, setFontSize] = useLocalStorage<number>("font-size", 18);
  const [verseInput, setVerseInput] = useState("");

  const { data: ch, isLoading } = useQuery({
    queryKey: ["chapter", book, chNum],
    queryFn: () => loadChapter(book, chNum),
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  });

  // Smooth scroll to selected verse
  const verseRefs = useRef<Record<number, HTMLParagraphElement | null>>({});
  useEffect(() => {
    if (!targetVerse || !ch) return;
    const el = verseRefs.current[targetVerse];
    if (el) {
      const t = setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      return () => clearTimeout(t);
    }
  }, [targetVerse, ch]);

  const toggleFav = (v: number) => {
    const key = `${book}-${chNum}-${v}`;
    setFavs(favs.includes(key) ? favs.filter((f) => f !== key) : [...favs, key]);
  };
  const toggleHl = (v: number) => {
    const key = `${book}-${chNum}-${v}`;
    setHighlights(
      highlights.includes(key) ? highlights.filter((f) => f !== key) : [...highlights, key],
    );
  };

  const totalCh = bookInfo?.chapters ?? 1;
  const prev = chNum > 1 ? chNum - 1 : null;
  const next = chNum < totalCh ? chNum + 1 : null;

  const handleJumpVerse = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(verseInput, 10);
    if (n >= 1 && ch && n <= ch.verses.length) {
      navigate({
        to: "/biblia/$book/$chapter",
        params: { book, chapter },
        search: { v: n },
        replace: true,
      });
      setVerseInput("");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between gap-2">
        <Link
          to="/biblia/$book"
          params={{ book }}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
          aria-label="Capítulos"
        >
          <List className="size-4" />
          <span className="hidden sm:inline">Capítulos</span>
        </Link>
        <div className="font-serif text-base truncate">
          {bookInfo?.name} {chNum}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setFontSize(Math.max(14, fontSize - 2))}
            className="size-8 rounded-full bg-secondary text-xs hover:bg-gold/10 transition"
            aria-label="Diminuir fonte"
          >
            A-
          </button>
          <button
            onClick={() => setFontSize(Math.min(28, fontSize + 2))}
            className="size-8 rounded-full bg-secondary text-sm hover:bg-gold/10 transition"
            aria-label="Aumentar fonte"
          >
            A+
          </button>
        </div>
      </header>

      {/* Quick chapter & verse jump */}
      <div className="mx-auto max-w-2xl px-4 pt-4 flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1 rounded-full bg-secondary px-1 py-1">
          {prev ? (
            <Link
              to="/biblia/$book/$chapter"
              params={{ book, chapter: String(prev) }}
              className="size-7 inline-flex items-center justify-center rounded-full hover:bg-card transition"
              aria-label="Capítulo anterior"
            >
              <ChevronLeft className="size-4" />
            </Link>
          ) : (
            <span className="size-7 opacity-30 inline-flex items-center justify-center">
              <ChevronLeft className="size-4" />
            </span>
          )}
          <Link
            to="/biblia/$book"
            params={{ book }}
            className="px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Cap. {chNum} / {totalCh}
          </Link>
          {next ? (
            <Link
              to="/biblia/$book/$chapter"
              params={{ book, chapter: String(next) }}
              className="size-7 inline-flex items-center justify-center rounded-full hover:bg-card transition"
              aria-label="Próximo capítulo"
            >
              <ChevronRight className="size-4" />
            </Link>
          ) : (
            <span className="size-7 opacity-30 inline-flex items-center justify-center">
              <ChevronRight className="size-4" />
            </span>
          )}
        </div>
        <form onSubmit={handleJumpVerse} className="flex-1 min-w-[140px]">
          <input
            value={verseInput}
            onChange={(e) => setVerseInput(e.target.value)}
            inputMode="numeric"
            placeholder="Ir para versículo…"
            className="w-full rounded-full bg-secondary px-4 py-1.5 text-xs outline-none focus:ring-2 focus:ring-gold"
          />
        </form>
      </div>

      <article className="mx-auto max-w-2xl px-6 py-6">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-5 bg-secondary rounded" />
            ))}
          </div>
        ) : ch ? (
          <div className="space-y-4 animate-fade-up">
            {ch.verses.map((v) => {
              const key = `${book}-${chNum}-${v.verse}`;
              const isFav = favs.includes(key);
              const isHl = highlights.includes(key);
              const isTarget = v.verse === targetVerse;
              return (
                <p
                  key={v.verse}
                  ref={(el) => {
                    verseRefs.current[v.verse] = el;
                  }}
                  className={`font-serif leading-relaxed text-card-foreground group rounded-md px-2 -mx-2 transition-all duration-500 scroll-mt-32 ${
                    isTarget
                      ? "bg-gold/20 ring-2 ring-gold/40"
                      : isHl
                        ? "bg-gold/10"
                        : ""
                  }`}
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <sup className="mr-1.5 text-xs font-sans font-bold text-gold">
                    {v.verse}
                  </sup>
                  <span onDoubleClick={() => toggleHl(v.verse)}>{v.text}</span>
                  <button
                    onClick={() => toggleFav(v.verse)}
                    className="ml-2 opacity-60 hover:opacity-100 transition"
                    aria-label="Favoritar"
                  >
                    <Heart
                      className={`inline size-3.5 ${
                        isFav ? "fill-gold text-gold" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                </p>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12 font-serif">
            Capítulo não encontrado.
          </p>
        )}

        <nav className="mt-12 flex justify-between gap-3">
          {prev ? (
            <Link
              to="/biblia/$book/$chapter"
              params={{ book, chapter: String(prev) }}
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <ChevronLeft className="size-4" /> Cap. {prev}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              to="/biblia/$book/$chapter"
              params={{ book, chapter: String(next) }}
              className="inline-flex items-center gap-1 text-sm text-primary ml-auto hover:underline"
            >
              Cap. {next} <ChevronRight className="size-4" />
            </Link>
          )}
        </nav>
      </article>
      <BottomNav />
    </div>
  );
}
