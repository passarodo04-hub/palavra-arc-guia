import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, BookOpenCheck, Search, Sparkles } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { resumosBiblicos, searchResumos } from "@/lib/resumo-biblico-data";

export const Route = createFileRoute("/resumo/")({
  component: ResumoIndex,
  head: () => ({
    meta: [
      { title: "Resumo Bíblico — Visão geral dos 66 livros" },
      { name: "description", content: "Resumos concisos e educativos de todos os 66 livros da Bíblia: autor, contexto, tema, propósito e versículos-chave." },
    ],
  }),
});

function ResumoIndex() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => searchResumos(query), [query]);
  const old = filtered.filter((r) => r.testament === "old");
  const neu = filtered.filter((r) => r.testament === "new");

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="relative overflow-hidden bg-gradient-spiritual text-primary-foreground">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 80% 10%, white, transparent 50%)" }} />
        <div className="relative mx-auto max-w-3xl px-6 pt-10 pb-12">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-primary-foreground/80 hover:text-primary-foreground">
            <ArrowLeft className="size-3.5" /> Início
          </Link>
          <div className="mt-4 flex items-center gap-2 text-gold">
            <Sparkles className="size-4" />
            <span className="text-xs font-medium uppercase tracking-[0.2em]">Resumo Bíblico</span>
          </div>
          <h1 className="mt-3 font-serif text-3xl md:text-4xl leading-tight">
            Conheça cada livro da Bíblia<br />em poucos minutos.
          </h1>
          <p className="mt-2 text-sm text-primary-foreground/70 max-w-md">
            Autor, contexto, tema, propósito e versículos-chave dos 66 livros, com leitura rápida e elegante.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 -mt-8">
        <div className="rounded-2xl border border-border bg-card p-3 shadow-elegant">
          <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por livro, tema ou autor…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {old.length > 0 && (
          <Section title="Antigo Testamento" items={old} />
        )}
        {neu.length > 0 && (
          <Section title="Novo Testamento" items={neu} />
        )}
        {filtered.length === 0 && (
          <p className="mt-8 text-center text-sm text-muted-foreground">Nenhum livro encontrado.</p>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

function Section({ title, items }: { title: string; items: typeof resumosBiblicos }) {
  return (
    <section className="mt-8">
      <h2 className="px-2 font-serif text-xl text-foreground">{title}</h2>
      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((r) => (
          <Link
            key={r.id}
            to="/resumo/$book"
            params={{ book: r.id }}
            className="group rounded-2xl border border-border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold/40"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-secondary text-gold transition-colors group-hover:bg-gold group-hover:text-gold-foreground">
              <BookOpenCheck className="size-4" />
            </div>
            <div className="mt-3 font-serif text-base text-card-foreground">{r.name}</div>
            <div className="line-clamp-2 text-xs text-muted-foreground">{r.theme}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}