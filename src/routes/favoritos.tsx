import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { useLocalStorage } from "@/lib/storage";
import { getBook, getChapter } from "@/lib/bible-data";

export const Route = createFileRoute("/favoritos")({ component: FavPage });

function FavPage() {
  const [favs] = useLocalStorage<string[]>("fav-verses", []);
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-gradient-spiritual text-primary-foreground px-6 py-8">
        <h1 className="font-serif text-3xl">Favoritos</h1>
        <p className="text-sm text-primary-foreground/70">Versos guardados no coração</p>
      </header>
      <div className="mx-auto max-w-3xl px-4 pt-6 space-y-3">
        {favs.length === 0 ? (
          <p className="text-center text-muted-foreground py-12 font-serif text-lg">Você ainda não favoritou nenhum versículo.</p>
        ) : (
          favs.map((key) => {
            const [book, ch, v] = key.split("-");
            const chapter = getChapter(book, parseInt(ch, 10));
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
        )}
      </div>
      <BottomNav />
    </div>
  );
}