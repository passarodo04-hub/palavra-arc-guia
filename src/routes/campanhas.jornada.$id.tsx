import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { VerseCard } from "@/components/campaigns/VerseCard";
import { useAllCampaigns, verseForDay } from "@/lib/campaigns";
import { JOURNEYS, journeyById, journeyProgress } from "@/lib/journeys";

export const Route = createFileRoute("/campanhas/jornada/$id")({
  loader: ({ params }) => {
    const j = journeyById(params.id);
    if (!j) throw notFound();
    return { title: j.title, synopsis: j.synopsis };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Jornada não encontrada — Palavra+" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `Jornada ${loaderData.title} — Palavra+`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.synopsis },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.synopsis },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: JourneyDetail,
});

function JourneyDetail() {
  const { id } = Route.useParams();
  const state = useAllCampaigns();
  const journey = journeyById(id) ?? JOURNEYS[0];
  const item = journeyProgress(journey, state);
  const v = verseForDay(journey.title.length);

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        eyebrow={{ icon: journey.icon, label: "Jornada" }}
        title={journey.title}
        description={journey.synopsis}
        backTo="/campanhas"
        backLabel="Jornadas"
      />

      <main className="mx-auto max-w-3xl space-y-6 px-4 pt-6">
        <section className="animate-fade-up rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-widest text-gold">Seu progresso</div>
            <div className="font-serif text-2xl text-foreground tabular-nums">{item.percent}%</div>
          </div>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-secondary"
            role="progressbar"
            aria-valuenow={item.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progresso da Jornada ${journey.title}`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold to-primary transition-[width]"
              style={{ width: `${item.percent}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {item.modulesDone} de {item.modulesTotal} {item.modulesTotal === 1 ? "módulo concluído" : "módulos concluídos"}
            {item.currentModule && !item.currentModule.completed && ` · próximo: ${item.currentModule.title}`}
          </p>
          {item.currentModule && (
            <Link
              to={item.currentModule.route}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-gold px-6 text-sm font-semibold text-gold-foreground transition-colors hover:bg-gold/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.started ? "Continuar Jornada" : "Começar Jornada"}
              <ArrowRight className="size-4" />
            </Link>
          )}
        </section>

        <section className="animate-fade-up space-y-3">
          <h2 className="px-1 font-serif text-2xl text-foreground">Módulos da Jornada</h2>
          {item.modules.map((m, i) => (
            <Link
              key={m.campaignId + i}
              to={m.route}
              className="group flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary font-serif text-lg text-foreground">
                {m.completed ? <CheckCircle2 className="size-5 text-gold" aria-hidden /> : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-serif text-lg text-card-foreground">{m.title}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{m.description}</span>
                <span className="mt-2 block text-[11px] uppercase tracking-widest text-gold">{m.detail}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
            </Link>
          ))}
        </section>

        <VerseCard text={v.text} ref={v.ref} />

        <section className="animate-fade-up rounded-3xl border border-border bg-secondary/40 p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold">
            <Sparkles className="size-3.5" aria-hidden /> Outras Jornadas
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {JOURNEYS.filter((j) => j.id !== journey.id)
              .slice(0, 6)
              .map((j) => (
                <Link
                  key={j.id}
                  to="/campanhas/jornada/$id"
                  params={{ id: j.id }}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:border-gold/50"
                >
                  <span aria-hidden className="mr-1">{j.emoji}</span>
                  {j.title}
                </Link>
              ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
