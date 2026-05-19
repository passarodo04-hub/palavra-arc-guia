import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/BottomNav";
import { loadHymn } from "@/lib/harpa-data";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocalStorage } from "@/lib/storage";

export const Route = createFileRoute("/harpa/$id")({ component: HymnPage });

function HymnPage() {
  const { id } = Route.useParams();
  const hid = parseInt(id, 10);
  const { data: h, isLoading } = useQuery({
    queryKey: ["hymn", hid],
    queryFn: () => loadHymn(hid),
    staleTime: Infinity,
  });
  const [favs, setFavs] = useLocalStorage<number[]>("fav-hymns", []);
  const isFav = favs.includes(hid);
  const toggle = () => setFavs(isFav ? favs.filter((x) => x !== hid) : [...favs, hid]);
  const prev = hid > 1 ? hid - 1 : null;
  const next = hid < 640 ? hid + 1 : null;

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <Link to="/harpa" className="text-sm text-muted-foreground">← Harpa</Link>
        <div className="font-serif">Hino {hid}</div>
        <button onClick={toggle} aria-label="Favoritar" className="size-8 rounded-full bg-secondary flex items-center justify-center">
          <Heart className={`size-4 ${isFav ? "fill-gold text-gold" : "text-muted-foreground"}`} />
        </button>
      </header>
      <article className="mx-auto max-w-xl px-6 py-10 text-center">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-secondary rounded w-2/3 mx-auto" />
            <div className="h-32 bg-secondary rounded" />
          </div>
        ) : !h ? (
          <p className="text-muted-foreground font-serif">Hino não encontrado.</p>
        ) : (
          <>
            <h1 className="font-serif text-3xl text-foreground">{h.title}</h1>
            <div className="mt-8 space-y-7 font-serif text-lg leading-relaxed text-card-foreground">
              {h.stanzas.map((stanza, i) => (
                <div key={i}>
                  <div className="text-xs text-gold mb-1 tracking-widest uppercase">{i + 1}ª estrofe</div>
                  <p className="whitespace-pre-line">{stanza}</p>
                  {h.chorus && (
                    <p className="mt-4 italic text-muted-foreground whitespace-pre-line border-l-2 border-gold/40 pl-4 mx-auto max-w-sm">
                      {h.chorus}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        <nav className="mt-12 flex justify-between">
          {prev ? (
            <Link to="/harpa/$id" params={{ id: String(prev) }} className="inline-flex items-center gap-1 text-sm text-primary">
              <ChevronLeft className="size-4" /> {prev}
            </Link>
          ) : <span />}
          {next && (
            <Link to="/harpa/$id" params={{ id: String(next) }} className="inline-flex items-center gap-1 text-sm text-primary ml-auto">
              {next} <ChevronRight className="size-4" />
            </Link>
          )}
        </nav>
      </article>
      <BottomNav />
    </div>
  );
}
