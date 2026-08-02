import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import { BookOpen, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { useBibleReads } from "@/hooks/use-bible-reads";
import { computeBibleJourney, stageById } from "@/lib/bible-journey";

export const Route = createFileRoute("/campanhas/jornada-biblica/etapa/$stageId")({
  loader: ({ params }) => {
    const s = stageById(params.stageId);
    if (!s) throw notFound();
    return { title: s.title, description: s.description };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Etapa não encontrada — Palavra+" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.title} — Jornada Bíblica — Palavra+`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.description },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background p-8 text-center text-muted-foreground">
      Etapa não encontrada. <Link to="/campanhas/jornada-biblica" className="text-gold underline">Voltar à jornada</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div role="alert" className="min-h-screen bg-background p-8 text-center text-muted-foreground">
      {error.message}
    </div>
  ),
  component: StageDetail,
});

function StageDetail() {
  const { stageId } = Route.useParams();
  const { readSet } = useBibleReads();
  const j = useMemo(() => computeBibleJourney(readSet), [readSet]);
  const s = j.stages.find((x) => x.stage.id === stageId) ?? j.stages[0];
  const stage = s.stage;
  const next = s.next;

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        eyebrow={{ icon: BookOpen, label: `Etapa ${s.index + 1} de ${j.stages.length}` }}
        title={`${stage.emoji} ${stage.title}`}
        description={stage.description}
        backTo="/campanhas/jornada-biblica"
        backLabel="Jornada Bíblica"
      />

      <main className="mx-auto max-w-3xl space-y-6 px-4 pt-6">
        <section className="animate-fade-up rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-gold">Progresso da etapa</div>
              <div className="mt-1 font-serif text-3xl text-card-foreground tabular-nums">{s.percent}%</div>
            </div>
            {s.completed && (
              <span className="animate-fade-up inline-flex items-center gap-1.5 rounded-full border border-gold/60 bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
                <CheckCircle2 className="size-3.5" /> Etapa concluída
              </span>
            )}
          </div>
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold to-primary transition-[width] duration-700 motion-reduce:transition-none"
              style={{ width: `${s.percent}%` }}
            />
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Capítulos lidos" value={String(s.readChapters)} accent />
            <Stat label="Restantes" value={String(s.remainingChapters)} />
            <Stat label="Livros" value={`${s.booksCompleted}/${s.books.length}`} />
            <Stat label="XP da etapa" value={(s.readChapters * 5).toLocaleString("pt-BR")} />
          </dl>
          {s.completed ? (
            <p className="mt-4 text-sm text-foreground">
              🎉 Parabéns! Você concluiu esta etapa da jornada. A próxima já está desbloqueada.
            </p>
          ) : next ? (
            <Button asChild className="mt-5 h-11 rounded-full bg-gold px-6 font-semibold text-gold-foreground hover:bg-gold/90">
              <Link to="/biblia/$book/$chapter" params={{ book: next.book, chapter: String(next.chapter) }}>
                Continuar leitura <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : null}
        </section>

        <section className="animate-fade-up rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-gold">
            <Sparkles className="size-3.5" /> Versículo-chave
          </div>
          <blockquote className="mt-2 font-serif text-lg text-card-foreground">"{stage.keyVerse.text}"</blockquote>
          <div className="mt-1 text-xs text-muted-foreground">— {stage.keyVerse.ref}</div>
          {stage.curiosity && (
            <p className="mt-4 rounded-2xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Você sabia? </span>
              {stage.curiosity}
            </p>
          )}
        </section>

        <section className="animate-fade-up rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-serif text-xl text-card-foreground">Livros desta etapa</h2>
          <ul className="mt-4 space-y-3">
            {s.books.map((b) => (
              <li key={b.id}>
                <Link
                  to="/biblia/$book"
                  params={{ book: b.id }}
                  className="block rounded-2xl border border-border bg-secondary/30 p-4 transition-colors hover:border-gold/50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-serif text-base text-foreground">{b.name}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {b.read}/{b.chapters} · {b.percent}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-gold transition-[width] duration-700 motion-reduce:transition-none"
                      style={{ width: `${b.percent}%` }}
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/40 p-3">
      <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className={`mt-1 font-serif text-base ${accent ? "text-gold" : "text-foreground"}`}>{value}</dd>
    </div>
  );
}
