import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { JourneyProgress } from "@/lib/journeys";

export function JourneyCard({ item, wide = false }: { item: JourneyProgress; wide?: boolean }) {
  const { journey: j } = item;
  const Icon = j.icon;
  const status = item.percent >= 100 ? "Concluída" : item.active ? "Em andamento" : item.started ? "Retomar" : "Nova";

  return (
    <Link
      to="/campanhas/jornada/$id"
      params={{ id: j.id }}
      aria-label={`Entrar na Jornada ${j.title}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-elegant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div
        className={`relative flex items-end ${wide ? "h-32" : "h-24"} p-4`}
        style={{ backgroundImage: j.art }}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
        <div className="relative flex w-full items-center justify-between gap-2">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 text-hero-foreground backdrop-blur">
            <Icon className="size-5" aria-hidden />
          </span>
          <span className="rounded-full bg-black/35 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-hero-foreground backdrop-blur">
            {status}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-serif text-lg text-card-foreground">
          <span aria-hidden className="mr-1.5">{j.emoji}</span>
          {j.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{j.synopsis}</p>

        {item.started && (
          <div className="mt-3">
            <div
              className="h-1.5 overflow-hidden rounded-full bg-secondary"
              role="progressbar"
              aria-valuenow={item.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progresso da Jornada ${j.title}`}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-primary"
                style={{ width: `${item.percent}%` }}
              />
            </div>
            <div className="mt-1.5 text-[11px] text-muted-foreground">
              {item.percent}%
              {item.modulesTotal > 1 && ` · ${item.modulesDone} de ${item.modulesTotal} módulos`}
            </div>
          </div>
        )}

        <div className="mt-auto pt-4">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gold">
            {item.started ? "Continuar Jornada" : "Entrar na Jornada"}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
          </span>
        </div>
      </div>
    </Link>
  );
}
