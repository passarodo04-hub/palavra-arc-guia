import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { getHymn } from "@/lib/harpa-data";

export const Route = createFileRoute("/harpa/$id")({ component: HymnPage });

function HymnPage() {
  const { id } = Route.useParams();
  const h = getHymn(parseInt(id, 10));
  if (!h) return <div className="p-8">Hino não encontrado. <Link to="/harpa" className="text-gold">Voltar</Link></div>;
  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <Link to="/harpa" className="text-sm text-muted-foreground">← Harpa</Link>
        <div className="font-serif">Hino {h.id}</div>
        <span />
      </header>
      <article className="mx-auto max-w-xl px-6 py-10 text-center">
        <h1 className="font-serif text-3xl text-foreground">{h.title}</h1>
        <div className="mt-8 space-y-6 font-serif text-lg leading-relaxed text-card-foreground">
          {h.lyrics.map((stanza, i) => (
            <div key={i}>
              <div className="text-xs text-gold mb-1">{i + 1}ª estrofe</div>
              <p className="whitespace-pre-line">{stanza}</p>
              {h.chorus && i === 0 && (
                <p className="mt-4 italic text-muted-foreground whitespace-pre-line">{h.chorus}</p>
              )}
            </div>
          ))}
        </div>
      </article>
      <BottomNav />
    </div>
  );
}