import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { BookOpen, Lock, CheckCircle2, ArrowRight, Sparkles, Flame } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { useBibleReads } from "@/hooks/use-bible-reads";
import { computeBibleJourney } from "@/lib/bible-journey";

export const Route = createFileRoute("/campanhas/jornada-biblica/")({
  head: () => ({
    meta: [
      { title: "Jornada Bíblica — Caminhe pelas Escrituras — Palavra+" },
      {
        name: "description",
        content:
          "Percorra a Bíblia como uma jornada: etapas conectadas do Pentateuco ao Apocalipse, com progresso real, livros concluídos e XP conquistado.",
      },
      { property: "og:title", content: "Jornada Bíblica — Palavra+" },
      {
        property: "og:description",
        content: "Etapas conectadas do Pentateuco ao Apocalipse, com progresso real de leitura.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JornadaBiblicaPage,
});

function JornadaBiblicaPage() {
  const { readSet, loading, synced } = useBibleReads();
  const j = useMemo(() => computeBibleJourney(readSet), [readSet]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        eyebrow={{ icon: BookOpen, label: "Jornada Bíblica" }}
        title="Sua caminhada pelas Escrituras"
        description="Do Gênesis ao Apocalipse, uma etapa de cada vez. A leitura da Bíblia continua livre — a jornada apenas acompanha o seu avanço."
        backTo="/campanhas"
        backLabel="Jornadas"
      />

      <main className="mx-auto max-w-3xl space-y-6 px-4 pt-6">
        {/* Overview */}
        <section className="animate-fade-up rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-gold">Progresso geral</div>
              <div className="mt-1 font-serif text-3xl text-card-foreground tabular-nums">{j.percent}%</div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              {loading ? "Carregando progresso…" : synced ? "Sincronizado com sua conta" : "Salvo neste dispositivo"}
            </div>
          </div>
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold to-primary transition-[width] duration-700 motion-reduce:transition-none"
              style={{ width: `${j.percent}%` }}
            />
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Capítulos lidos" value={`${j.readChapters}/${j.totalChapters}`} />
            <Stat label="Livros concluídos" value={`${j.booksCompleted}/66`} />
            <Stat label="Etapa atual" value={j.current?.stage.title ?? "—"} />
            <Stat label="XP da leitura" value={j.xp.toLocaleString("pt-BR")} accent />
          </dl>
          {j.nextStage && (
            <p className="mt-4 text-xs text-muted-foreground">
              Próxima etapa: <span className="font-medium text-foreground">{j.nextStage.stage.title}</span>
            </p>
          )}
        </section>

        {/* Map */}
        <section className="animate-fade-up">
          <h2 className="px-1 font-serif text-xl text-foreground">O caminho</h2>
          <ol className="relative mt-4 space-y-3">
            <li className="flex items-center gap-3 px-1 text-sm text-muted-foreground">
              <span aria-hidden className="text-lg">🌱</span>
              Começo da Jornada
            </li>
            {j.stages.map((s) => (
              <li key={s.stage.id} className="relative">
                <span
                  aria-hidden
                  className="absolute left-7 -top-3 h-3 w-px bg-border"
                />
                <StageRow s={s} />
              </li>
            ))}
          </ol>
        </section>

        <section className="animate-fade-up rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-gold">
            <Sparkles className="size-3.5" /> Como o progresso conta
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Marque um capítulo como lido no próprio leitor da Bíblia. Cada capítulo vale{" "}
            <span className="font-medium text-foreground">5 XP</span> e avança automaticamente a etapa correspondente.
          </p>
          <Button asChild variant="secondary" className="mt-4 h-10 rounded-full px-5">
            <Link to="/biblia">Abrir a Bíblia <ArrowRight className="size-4" /></Link>
          </Button>
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

function StageRow({ s }: { s: ReturnType<typeof computeBibleJourney>["stages"][number] }) {
  const locked = !s.unlocked;
  const content = (
    <div
      className={`flex items-center gap-4 rounded-2xl border p-4 transition-all ${
        locked
          ? "border-dashed border-border bg-secondary/30"
          : s.completed
            ? "border-gold/60 bg-gold/10 shadow-soft"
            : "border-border bg-card shadow-soft hover:border-gold/50"
      }`}
    >
      <span
        aria-hidden
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-xl ${
          locked ? "bg-secondary opacity-60" : "bg-secondary"
        }`}
      >
        {locked ? <Lock className="size-4 text-muted-foreground" /> : s.stage.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`font-serif text-base ${locked ? "text-muted-foreground" : "text-foreground"}`}>
            {s.stage.title}
          </span>
          {s.completed && <CheckCircle2 className="size-4 text-gold" aria-label="Etapa concluída" />}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {locked
            ? "Bloqueada — conclua a etapa anterior"
            : `${s.readChapters} de ${s.totalChapters} capítulos · ${s.percent}%`}
        </div>
        {!locked && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gold transition-[width] duration-700 motion-reduce:transition-none"
              style={{ width: `${s.percent}%` }}
            />
          </div>
        )}
      </div>
      {!locked && <ArrowRight className="size-4 shrink-0 text-muted-foreground" />}
      {locked && s.percent === 0 && <Flame className="size-4 shrink-0 text-muted-foreground opacity-0" />}
    </div>
  );

  if (locked) {
    return (
      <div aria-disabled className="block opacity-70">
        {content}
      </div>
    );
  }
  return (
    <Link
      to="/campanhas/jornada-biblica/etapa/$stageId"
      params={{ stageId: s.stage.id }}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-2xl"
    >
      {content}
    </Link>
  );
}
