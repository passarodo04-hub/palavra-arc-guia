import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { getBook, bibleBooks } from "@/lib/bible-data";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/biblia/$book/")({
  component: ChapterSelectPage,
});

function ChapterSelectPage() {
  const { book } = Route.useParams();
  const info = getBook(book);
  const [q, setQ] = useState("");
  const router = useRouter();

  if (!info) {
    return (
      <div className="min-h-screen bg-background p-8 text-center pb-24">
        <p className="font-serif text-muted-foreground">Livro não encontrado.</p>
        <Link to="/biblia" className="text-primary text-sm mt-4 inline-block">
          ← Voltar aos livros
        </Link>
        <BottomNav />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(q, 10);
    if (n >= 1 && n <= info.chapters) {
      router.navigate({
        to: "/biblia/$book/$chapter",
        params: { book, chapter: String(n) },
      });
    }
  };

  const chapters = Array.from({ length: info.chapters }, (_, i) => i + 1);
  const filtered = q.trim()
    ? chapters.filter((c) => String(c).includes(q.trim()))
    : chapters;

  const bookIdx = bibleBooks.findIndex((b) => b.id === book);
  const prevBook = bookIdx > 0 ? bibleBooks[bookIdx - 1] : null;
  const nextBook =
    bookIdx >= 0 && bookIdx < bibleBooks.length - 1 ? bibleBooks[bookIdx + 1] : null;

  return (
    <div className="min-h-screen bg-background pb-28 animate-fade-up">
      <header className="bg-gradient-spiritual text-primary-foreground px-6 py-7">
        <Link
          to="/biblia"
          className="inline-flex items-center gap-1 text-xs text-primary-foreground/70 hover:text-primary-foreground transition"
        >
          <ChevronLeft className="size-4" /> Livros
        </Link>
        <h1 className="font-serif text-3xl mt-3">{info.name}</h1>
        <p className="text-sm text-primary-foreground/70">
          {info.chapters} capítulos · Escolha um capítulo
        </p>
      </header>

      <div className="mx-auto max-w-3xl px-4 pt-6">
        <form onSubmit={handleSubmit}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            inputMode="numeric"
            placeholder="Ir para capítulo… (digite o número e pressione Enter)"
            className="w-full rounded-full bg-secondary px-5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold"
          />
        </form>

        <div className="mt-6 grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-2">
          {filtered.map((c) => (
            <Link
              key={c}
              to="/biblia/$book/$chapter"
              params={{ book, chapter: String(c) }}
              className="aspect-square rounded-xl border border-border bg-card flex items-center justify-center font-serif text-base text-card-foreground hover:border-gold hover:bg-gold/10 hover:shadow-soft transition"
            >
              {c}
            </Link>
          ))}
        </div>

        <nav className="mt-10 flex justify-between text-sm">
          {prevBook ? (
            <Link
              to="/biblia/$book"
              params={{ book: prevBook.id }}
              className="inline-flex items-center gap-1 text-primary"
            >
              <ChevronLeft className="size-4" /> {prevBook.name}
            </Link>
          ) : (
            <span />
          )}
          {nextBook && (
            <Link
              to="/biblia/$book"
              params={{ book: nextBook.id }}
              className="inline-flex items-center gap-1 text-primary ml-auto"
            >
              {nextBook.name} <ChevronRight className="size-4" />
            </Link>
          )}
        </nav>
      </div>
      <BottomNav />
    </div>
  );
}