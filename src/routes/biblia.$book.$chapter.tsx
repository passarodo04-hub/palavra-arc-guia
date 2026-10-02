import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/BottomNav";
import { getBook, loadChapter } from "@/lib/bible-data";
import { useTranslation } from "@/lib/translation-context";
import { ChevronLeft, ChevronRight, Heart, Highlighter, List } from "lucide-react";
import { useLocalStorage } from "@/lib/storage";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { HighlightPicker } from "@/components/bible/HighlightPicker";
import { highlightKey, useBibleHighlights, type HighlightLocation } from "@/lib/bible-highlights";
import { useBibleReads } from "@/hooks/use-bible-reads";
import { useNarration } from "@/hooks/use-narration";
import { NarrationPlayer } from "@/components/bible/NarrationPlayer";

type Search = { v?: number };

export const Route = createFileRoute("/biblia/$book/$chapter")({
  component: ReaderPage,
  head: ({ params }) => ({ meta: [
    { title: `${getBook(params.book)?.name ?? "Bíblia"} ${params.chapter} | Palavra+` },
    { name: "description", content: "Leia e marque versículos da Bíblia no Palavra+." },
    { property: "og:title", content: `${getBook(params.book)?.name ?? "Bíblia"} ${params.chapter} | Palavra+` },
    { property: "og:description", content: "Leia e marque versículos da Bíblia no Palavra+." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
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
  const [fontSize, setFontSize] = useLocalStorage<number>("font-size", 18);
  const [verseInput, setVerseInput] = useState("");
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [chapterPicker, setChapterPicker] = useState(false);
  const { translation } = useTranslation();
  const { items: highlights, setHighlight, busy: highlightBusy, error: highlightError } = useBibleHighlights();
  const currentLocation = (verse: number | null): HighlightLocation => ({ translation, book, chapter: chNum, verse });
  const chapterMark = highlights.find((h) => highlightKey(h) === highlightKey(currentLocation(null)));
  const selectedMark = selectedVerse == null ? undefined : highlights.find((h) => highlightKey(h) === highlightKey(currentLocation(selectedVerse)));
  useEffect(() => { setSelectedVerse(null); setChapterPicker(false); }, [book, chNum, translation]);
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
  const narration = useNarration({ translation, book, chapter: chNum, verses: ch?.verses });
  const narratedVerse = narration.state.currentVerse;
  useEffect(() => {
    if (narratedVerse == null) return;
    verseRefs.current[narratedVerse]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [narratedVerse]);
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
  const totalCh = bookInfo?.chapters ?? 1;
  const prev = chNum > 1 ? chNum - 1 : null;
  const next = chNum < totalCh ? chNum + 1 : null;
  return (
    <div className="min-h-screen bg-background pb-52">
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
        {ch && <div className="mb-6">
          <Button type="button" variant="outline" size="sm" onClick={() => setChapterPicker(!chapterPicker)} aria-expanded={chapterPicker}>
            <Highlighter /> {chapterMark ? "Alterar marcação do capítulo" : `Marcar capítulo — ${bookInfo?.name} ${chNum}`}
          </Button>
          {chapterPicker && <div className="mt-2"><HighlightPicker color={chapterMark?.color} disabled={highlightBusy} onChange={async (color) => { await setHighlight(currentLocation(null), color); setChapterPicker(false); }} /></div>}
          {highlightError && <p role="alert" className="mt-2 text-sm text-destructive">{highlightError}</p>}
        </div>}
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
              const mark = highlights.find((h) => highlightKey(h) === highlightKey(currentLocation(v.verse)));
              const color = mark?.color ?? chapterMark?.color;
              const isTarget = targetVerse === v.verse;
              const isNarrating = narratedVerse === v.verse;
              return (
                <p
                  key={v.verse}
                  ref={(el) => { verseRefs.current[v.verse] = el; }}
                  aria-current={isNarrating ? "true" : undefined}
                  className={`font-serif leading-relaxed text-card-foreground group rounded-md transition px-2 -mx-2 ${color ? `highlight-verse-${color}` : ""} ${isTarget ? "ring-2 ring-gold/40" : ""} ${isNarrating ? "ring-2 ring-primary/40" : ""}`}
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <sup className="mr-1.5 text-xs font-sans font-bold text-gold">{v.verse}</sup>
                  <span onClick={() => setSelectedVerse(selectedVerse === v.verse ? null : v.verse)} className="cursor-pointer" title="Selecionar versículo para marcar">{v.text}</span>
                  <button onClick={() => toggleFav(v.verse)} className="ml-2 opacity-60 hover:opacity-100 transition" aria-label="Favoritar">
                    <Heart className={`inline size-3.5 ${isFav ? "fill-gold text-gold" : "text-muted-foreground"}`} />
                  </button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setSelectedVerse(selectedVerse === v.verse ? null : v.verse)}
                    title="Marcar texto" aria-label={`Marcar texto, versículo ${v.verse}`} aria-expanded={selectedVerse === v.verse}
                    className="ml-1 size-9 align-middle"><Highlighter className={mark ? "text-primary" : "text-muted-foreground"} /></Button>
                  {selectedVerse === v.verse && <span className="mt-2 block text-sm" onClick={(e) => e.stopPropagation()}>
                    <span className="mb-1 block font-sans font-medium">Marcar texto · versículo {v.verse}</span>
                    <HighlightPicker color={selectedMark?.color} disabled={highlightBusy} onChange={async (next) => { await setHighlight(currentLocation(v.verse), next); setSelectedVerse(null); }} onClose={() => setSelectedVerse(null)} />
                  </span>}
                </p>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12 font-serif">Capítulo não encontrado.</p>
        )}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">
            Jornada Bíblica · marque este capítulo ao terminar
          </div>
          <button
            type="button"
            onClick={() => toggle(book, chNum, !chapterRead)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              chapterRead
                ? "bg-secondary text-foreground"
                : "bg-gold text-gold-foreground hover:bg-gold/90"
            }`}
          >
            {chapterRead ? "Lido — desfazer" : "Marcar como lido"}
          </button>
        </div>
        <nav className="mt-8 flex justify-between">
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
      {narration.available && (
        <div className="fixed inset-x-0 bottom-[72px] z-40 px-3 sm:bottom-4">
          <div className="mx-auto max-w-2xl">
            <NarrationPlayer
              state={narration.state}
              totalSeconds={narration.totalSeconds}
              resumeVerse={narration.resumeVerse}
              onToggle={narration.toggle}
              onStop={narration.stop}
              onSeekRelative={narration.seekRelative}
              onRate={narration.setRate}
              onVolume={narration.setVolume}
            />
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}
