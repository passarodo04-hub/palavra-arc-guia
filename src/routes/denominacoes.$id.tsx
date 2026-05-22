import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { getDenominacao } from "@/lib/denominacoes-data";
import { ChevronLeft, Calendar, Users, MapPin, History, Globe, Sparkles, Landmark } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/denominacoes/$id")({ component: DenominacaoDetail });

function DenominacaoDetail() {
  const { id } = Route.useParams();
  const d = getDenominacao(id);

  if (!d) {
    return (
      <div className="min-h-screen bg-background p-8 text-center pb-24">
        <p className="font-serif text-muted-foreground">Denominação não encontrada.</p>
        <Link to="/denominacoes" className="text-primary text-sm mt-4 inline-block">
          ← Voltar
        </Link>
        <BottomNav />
      </div>
    );
  }

  const blocks: { icon: LucideIcon; label: string; value: React.ReactNode }[] = [
    { icon: Calendar, label: "Fundação", value: d.founded },
    { icon: Users, label: "Fundadores", value: d.founders.join(", ") },
    { icon: Globe, label: "Origem", value: d.origin },
    { icon: MapPin, label: "Sede", value: d.headquarters },
  ];

  return (
    <div className="min-h-screen bg-background pb-28 animate-fade-up">
      <header className="bg-gradient-spiritual text-primary-foreground px-6 py-7">
        <Link
          to="/denominacoes"
          className="inline-flex items-center gap-1 text-xs text-primary-foreground/70 hover:text-primary-foreground"
        >
          <ChevronLeft className="size-4" /> Denominações
        </Link>
        <div className="mt-3 flex items-start gap-3">
          <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Landmark className="size-6 text-gold" />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-2xl md:text-3xl leading-tight">{d.name}</h1>
            {d.shortName && (
              <span className="text-xs uppercase tracking-widest text-primary-foreground/70">
                {d.shortName}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-6 space-y-6">
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {blocks.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold font-semibold">
                <Icon className="size-3.5" /> {label}
              </div>
              <div className="mt-1 text-sm text-card-foreground">{value}</div>
            </div>
          ))}
        </section>

        {d.notablePeople && d.notablePeople.length > 0 && (
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-gold">
              Pessoas importantes
            </div>
            <ul className="mt-2 flex flex-wrap gap-2">
              {d.notablePeople.map((p) => (
                <li
                  key={p}
                  className="px-3 py-1 rounded-full bg-secondary text-sm text-secondary-foreground"
                >
                  {p}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold">
            <History className="size-3.5" /> História
          </div>
          <p className="mt-2 font-serif text-base leading-relaxed text-card-foreground">
            {d.history}
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-gold">Expansão</div>
          <p className="mt-2 text-sm text-card-foreground">{d.expansion}</p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-gold">
            Presença no Brasil
          </div>
          <p className="mt-2 text-sm text-card-foreground">{d.brazil}</p>
        </section>

        {d.curiosities.length > 0 && (
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold">
              <Sparkles className="size-3.5" /> Curiosidades
            </div>
            <ul className="mt-2 space-y-2 text-sm text-card-foreground">
              {d.curiosities.map((c, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-gold">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <BottomNav />
    </div>
  );
}