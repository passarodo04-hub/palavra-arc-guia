import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { denominacoes } from "@/lib/denominacoes-data";
import { Search, Landmark, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/denominacoes")({ component: DenominacoesPage });

function DenominacoesPage() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const term = q.toLowerCase().trim();
    if (!term) return denominacoes;
    return denominacoes.filter((d) =>
      [d.name, d.shortName, ...(d.founders || []), ...(d.tags || []), d.headquarters, d.origin]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term)),
    );
  }, [q]);

  return (
    <div className="min-h-screen bg-background pb-28 animate-fade-up">
      <header className="bg-gradient-spiritual text-primary-foreground px-6 py-8">
        <div className="flex items-center gap-2 text-gold">
          <Landmark className="size-4" />
          <span className="text-xs font-medium uppercase tracking-[0.2em]">Enciclopédia</span>
        </div>
        <h1 className="font-serif text-3xl mt-2">Denominações Cristãs</h1>
        <p className="text-sm text-primary-foreground/70 mt-1">
          Conheça a história, fundadores e curiosidades das principais igrejas cristãs do Brasil e do mundo.
        </p>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por igreja, fundador, cidade…"
            className="w-full rounded-full bg-secondary pl-11 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        <div className="mt-2 text-xs text-muted-foreground px-2">{filtered.length} denominações</div>

        <ul className="mt-4 space-y-2">
          {filtered.map((d) => (
            <li key={d.id}>
              <Link
                to="/denominacoes/$id"
                params={{ id: d.id }}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 hover:border-gold/40 transition"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-spiritual text-gold shrink-0">
                  <Landmark className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-lg text-card-foreground truncate">{d.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    Fundada em {d.founded} · {d.founders.join(", ")}
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:text-gold" />
              </Link>
            </li>
          ))}
        </ul>

        {filtered.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nenhuma denominação encontrada.
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}