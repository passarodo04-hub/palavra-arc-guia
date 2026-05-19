import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/BottomNav";
import { getBook, loadChapter } from "@/lib/bible-data";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useLocalStorage } from "@/lib/storage";

export const Route = createFileRoute("/biblia/$book/$chapter")({ component: ReaderPage });

function ReaderPage() {
  const { book, chapter } = Route.useParams();
  const chNum = parseInt(chapter, 10);
  const bookInfo = getBook(book);
  const [favs, setFavs] = useLocalStorage<string[]>("fav-verses", []);
  const [highlights, setHighlights] = useLocalStorage<string[]>("highlight-verses", []);
  const [fontSize, setFontSize] = useLocalStorage<number>("font-size", 18);
  const { data: ch, isLoading } = useQuery({
    queryKey: ["chapter", book, chNum],
    queryFn: () => loadChapter(book, chNum),
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  });
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
        <Link to="/biblia" className="text-sm text-muted-foreground">← Livros</Link>
        <div className="font-serif text-base">{bookInfo?.name} {chNum}</div>
        <div className="flex gap-1">
          <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className="size-8 rounded-full bg-secondary text-xs">A-</button>
          <button onClick={() => setFontSize(Math.min(28, fontSize + 2))} className="size-8 rounded-full bg-secondary text-sm">A+</button>
        </div>
      </header>
      <article className="mx-auto max-w-2xl px-6 py-8">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-5 bg-secondary rounded" />
            ))}
          </div>
        ) : ch ? (
          <div className="space-y-4">
            {ch.verses.map((v) => {
              const key = `${book}-${chNum}-${v.verse}`;
              const isFav = favs.includes(key);
              const isHl = highlights.includes(key);
              return (
                <p
                  key={v.verse}
                  className={`font-serif leading-relaxed text-card-foreground group rounded-md transition ${isHl ? "bg-gold/10 px-2 -mx-2" : ""}`}
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
