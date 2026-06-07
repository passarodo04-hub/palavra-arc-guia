import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { getDenominacao } from "@/lib/denominacoes-data";
import { getDenominacaoExtra } from "@/lib/denominacoes-extras";
import {
  ChevronLeft,
  Calendar,
  Users,
  MapPin,
  History,
  Globe,
  Sparkles,
  Landmark,
  Clock,
  BookOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/denominacoes/$id")({ component: DenominacaoDetail });

function DenominacaoDetail() {
  const { id } = Route.useParams();
  const d = getDenominacao(id);
  const extra = getDenominacaoExtra(id);

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
      <div className="w-full bg-gradient-spiritual/10 border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <MapPin className="size-6 text-gold" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-widest text-gold font-semibold">
                Sede Nacional
              </div>
              <p className="text-base font-serif text-foreground mt-1 leading-snug">
                {d.headquarters}
              </p>
            </div>
          </div>
        </div>
      </div>
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

        {extra?.timeline && extra.timeline.length > 0 && (
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold">
              <Clock className="size-3.5" /> Linha do tempo
            </div>
            <ol className="mt-4 relative border-l border-border pl-4 space-y-4">
              {extra.timeline.map((t, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[21px] top-1 size-3 rounded-full bg-gold ring-4 ring-card" />
                  <div className="text-xs font-semibold text-gold">{t.year}</div>
                  <p className="text-sm text-card-foreground">{t.event}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {extra?.extras?.map((ex, i) => (
          <section
            key={i}
            className="rounded-2xl border border-gold/30 bg-card p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold">
              <BookOpen className="size-3.5" /> {ex.title}
            </div>
            {ex.subtitle && (
              <div className="mt-1 text-sm font-serif text-card-foreground/80">
                {ex.subtitle}
              </div>
            )}
            <p className="mt-3 text-sm leading-relaxed text-card-foreground">{ex.body}</p>
            {ex.bullets && ex.bullets.length > 0 && (
              <ul className="mt-3 space-y-2 text-sm text-card-foreground">
                {ex.bullets.map((b, j) => (
                  <li key={j} className="flex gap-2">
                    <span className="text-gold">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </main>
      <BottomNav />
    </div>
  );
}