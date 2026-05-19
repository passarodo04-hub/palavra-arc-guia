import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { getBook, getChapter, sampleChapters } from "@/lib/bible-data";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useLocalStorage } from "@/lib/storage";

export const Route = createFileRoute("/biblia/$book/$chapter")({ component: ReaderPage });

function ReaderPage() {
  const { book, chapter } = Route.useParams();
  const chNum = parseInt(chapter, 10);
  const bookInfo = getBook(book);
  const ch = getChapter(book, chNum);
  const [favs, setFavs] = useLocalStorage<string[]>("fav-verses", []);
  const [fontSize, setFontSize] = useLocalStorage<number>("font-size", 18);
  const toggleFav = (v: number) => {
    const key = `${book}-${chNum}-${v}`;
    setFavs(favs.includes(key) ? favs.filter((f) => f !== key) : [...favs, key]);
  };
  const avail = sampleChapters[book]?.map((c) => c.chapter) ?? [];
  const idx = avail.indexOf(chNum);
  const prev = idx > 0 ? avail[idx - 1] : null;
  const next = idx >= 0 && idx < avail.length - 1 ? avail[idx + 1] : null;
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
        {ch ? (
          <div className="space-y-4">
            {ch.verses.map((v) => {
              const key = `${book}-${chNum}-${v.verse}`;
              const isFav = favs.includes(key);
              return (
                <p key={v.verse} className="font-serif leading-relaxed text-card-foreground group" style={{ fontSize: `${fontSize}px` }}>
                  <sup className="mr-1.5 text-xs font-sans font-bold text-gold">{v.verse}</sup>
                  {v.text}
                  <button onClick={() => toggleFav(v.verse)} className="ml-2 opacity-60 hover:opacity-100 transition">
                    <Heart className={`inline size-3.5 ${isFav ? "fill-gold text-gold" : "text-muted-foreground"}`} />
                  </button>
                </p>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            <p className="font-serif text-xl">Este capítulo ainda não está disponível offline.</p>
            <p className="text-sm mt-2">Capítulos disponíveis: Gênesis 1, Salmos 23 e 91, João 3, Mateus 5, Provérbios 3, Filipenses 4.</p>
          </div>
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