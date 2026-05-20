import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/BottomNav";
import { loadHymnIndex } from "@/lib/harpa-data";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/harpa/")({ component: HarpaPage });

function HarpaPage() {
  const [q, setQ] = useState("");
  const { data: index = [], isLoading } = useQuery({
    queryKey: ["harpa-index"],
    queryFn: loadHymnIndex,
    staleTime: Infinity,
  });
  const filtered = useMemo(() => {
    const query = q.toLowerCase();
    return index.filter((h) => h.title.toLowerCase().includes(query) || String(h.id).includes(query));
  }, [index, q]);
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-gradient-spiritual text-primary-foreground px-6 py-8">
        <h1 className="font-serif text-3xl">Harpa Cristã</h1>
        <p className="text-sm text-primary-foreground/70">640 hinos para adoração</p>
      </header>
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar hino por número ou título..."
          className="w-full rounded-full bg-secondary px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-gold"
        />
        <div className="mt-3 text-xs text-muted-foreground px-2">
          {isLoading ? "Carregando..." : `${filtered.length} hinos`}
        </div>
        <ul className="mt-3 space-y-2">
          {filtered.slice(0, 200).map((h) => (
            <li key={h.id}>
              <Link
                to="/harpa/$id"
                params={{ id: String(h.id) }}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-gold/40 transition"
              >
                <div className="font-serif text-2xl text-gold w-12 text-center tabular-nums">{h.id}</div>
                <div className="font-serif text-lg text-card-foreground">{h.title}</div>
              </Link>
            </li>
          ))}
        </ul>
        {filtered.length > 200 && (
          <p className="mt-4 text-center text-xs text-muted-foreground">Mostrando os primeiros 200. Refine a busca.</p>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
