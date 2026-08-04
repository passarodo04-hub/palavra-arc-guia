import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Footprints, Sparkles, Trophy, Backpack, History, ArrowRight } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useWalk } from "@/hooks/use-walk";
import { CATEGORY_META, formatDayPt, walkMotivation, type ResolvedUnlockable } from "@/lib/walk";
import { UnlockableTile } from "@/components/walk/UnlockableTile";
import { UnlockDialog } from "@/components/walk/UnlockDialog";
import { CelebrationDialog } from "@/components/walk/CelebrationDialog";

export const Route = createFileRoute("/caminhada")({
  head: () => ({
    meta: [
      { title: "Minha Caminhada — Sua história com Deus — Palavra+" },
      {
        name: "description",
        content:
          "Veja sua evolução no Palavra+: nível, XP, sequência, progresso da Bíblia, conquistas, Mochila Espiritual e o histórico completo da sua caminhada.",
      },
      { property: "og:title", content: "Minha Caminhada — Palavra+" },
      {
        property: "og:description",
        content: "Nível, XP, sequência, conquistas, Mochila Espiritual e o histórico da sua caminhada.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div role="alert" className="min-h-screen bg-background p-8 text-center text-muted-foreground">
      {error.message}
    </div>
  ),
  component: CaminhadaPage,
});

function CaminhadaPage() {
  const { user } = useAuth();
  const walk = useWalk();
  const [selected, setSelected] = useState<ResolvedUnlockable | null>(null);
  const s = walk.stats;

  const displayName =
    (user?.user_metadata as { full_name?: string; name?: string } | undefined)?.full_name ??
    (user?.user_metadata as { name?: string } | undefined)?.name ??
    user?.email?.split("@")[0] ??
    null;

  const cards: { emoji: string; label: string; value: string }[] = [
    { emoji: "📖", label: "Bíblia concluída", value: `${s.biblePercent}%` },
    { emoji: "🔥", label: "Sequência atual", value: `${s.currentStreak} ${s.currentStreak === 1 ? "dia" : "dias"}` },
    { emoji: "⭐", label: "Nível", value: String(s.level) },
    { emoji: "✨", label: "XP", value: s.xp.toLocaleString("pt-BR") },
    { emoji: "🙏", label: "Orações registradas", value: String(s.prayersLogged) },
    { emoji: "❤️", label: "Gratidões registradas", value: String(s.gratitudeLogged) },
    { emoji: "🎒", label: "Itens da Mochila", value: `${walk.unlockedItems}/${walk.items.length}` },
    { emoji: "🏅", label: "Conquistas", value: `${walk.unlockedAchievements}/${walk.achievements.length}` },
    { emoji: "🗺️", label: "Lugares descobertos", value: String(s.placesDiscovered) },
    { emoji: "⏳", label: "Eventos da caminhada", value: String(walk.timelineCount) },
    { emoji: "📅", label: "Dias ativos", value: String(s.activeDays) },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        eyebrow={{ icon: Footprints, label: "Minha Caminhada" }}
        title={displayName ? `A caminhada de ${displayName}` : "Sua caminhada"}
        description={walkMotivation()}
      />

      <main className="mx-auto max-w-3xl space-y-6 px-4 pt-6">
        {/* Overview cards */}
        <section aria-labelledby="visao-geral" className="animate-fade-up motion-reduce:animate-none">
          <h2 id="visao-geral" className="px-1 font-serif text-xl text-foreground">
            Visão geral
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {cards.map((c) => (
              <div key={c.label} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                <dt className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  <span aria-hidden>{c.emoji}</span>
                  {c.label}
                </dt>
                <dd className="mt-2 font-serif text-xl tabular-nums text-card-foreground">{c.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 px-1 text-xs text-muted-foreground">
            {walk.loading
              ? "Carregando sua caminhada…"
              : walk.synced
                ? "Sincronizado com a sua conta."
                : "Salvo neste dispositivo — entre na sua conta para sincronizar."}
          </p>
        </section>

        {/* Progress */}
        <section
          aria-labelledby="progresso"
          className="animate-fade-up rounded-3xl border border-border bg-card p-6 shadow-soft motion-reduce:animate-none"
        >
          <h2 id="progresso" className="font-serif text-xl text-card-foreground">
            Seu progresso
          </h2>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
            <div className="font-serif text-2xl text-card-foreground">⭐ Nível {s.level}</div>
            <div className="text-sm tabular-nums text-muted-foreground">
              {s.levelXp.toLocaleString("pt-BR")} / {s.nextLevelXp.toLocaleString("pt-BR")} XP
            </div>
          </div>
          <div
            className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-secondary"
            role="progressbar"
            aria-valuenow={s.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso para o próximo nível"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold to-primary transition-[width] duration-700 motion-reduce:transition-none"
              style={{ width: `${s.percent}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {s.percent}% · faltam {Math.max(0, s.nextLevelXp - s.levelXp).toLocaleString("pt-BR")} XP para o
            nível {s.level + 1}
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
            <Stat label="XP total" value={s.xp.toLocaleString("pt-BR")} accent />
            <Stat label="Sequência atual" value={`${s.currentStreak} dias`} />
            <Stat label="Maior sequência" value={`${s.longestStreak} dias`} />
            <Stat label="Capítulos lidos" value={`${s.chaptersRead}/${s.totalChapters}`} />
            <Stat label="Livros concluídos" value={`${s.booksCompleted}/66`} />
            <Stat label="Jornadas concluídas" value={String(s.journeysCompleted)} />
          </dl>
          <Button asChild variant="secondary" className="mt-5 h-10 rounded-full px-5">
            <Link to="/campanhas/jornada-biblica">
              Ver Jornada Bíblica <ArrowRight className="size-4" />
            </Link>
          </Button>
        </section>

        {/* Achievements */}
        <section
          aria-labelledby="conquistas"
          className="animate-fade-up rounded-3xl border border-border bg-card p-6 shadow-soft motion-reduce:animate-none"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 id="conquistas" className="flex items-center gap-2 font-serif text-xl text-card-foreground">
              <Trophy className="size-5 text-gold" aria-hidden /> Conquistas
            </h2>
            <span className="text-xs tabular-nums text-muted-foreground">
              {walk.unlockedAchievements}/{walk.achievements.length}
            </span>
          </div>
          <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {walk.achievements.map((a) => (
              <li key={a.id}>
                <UnlockableTile item={a} onSelect={setSelected} />
              </li>
            ))}
          </ul>
        </section>

        {/* Backpack */}
        <section
          aria-labelledby="mochila"
          className="animate-fade-up overflow-hidden rounded-3xl border border-border bg-card shadow-soft motion-reduce:animate-none"
        >
          <div
            className="border-b border-border p-6"
            style={{
              backgroundImage:
                "linear-gradient(135deg, color-mix(in oklab, var(--gold) 16%, transparent), transparent 70%)",
            }}
          >
            <h2 id="mochila" className="flex items-center gap-2 font-serif text-xl text-card-foreground">
              <Backpack className="size-5 text-gold" aria-hidden /> Mochila Espiritual
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Uma coleção pessoal de símbolos da sua caminhada. Eles não dão vantagens — apenas guardam
              momentos.
            </p>
          </div>
          <ul className="grid grid-cols-3 gap-3 p-6 sm:grid-cols-4 lg:grid-cols-5">
            {walk.items.map((i) => (
              <li key={i.id}>
                <UnlockableTile item={i} onSelect={setSelected} />
              </li>
            ))}
          </ul>
        </section>

        {/* Timeline */}
        <section
          aria-labelledby="historico"
          className="animate-fade-up rounded-3xl border border-border bg-card p-6 shadow-soft motion-reduce:animate-none"
        >
          <h2 id="historico" className="flex items-center gap-2 font-serif text-xl text-card-foreground">
            <History className="size-5 text-gold" aria-hidden /> Histórico da Caminhada
          </h2>
          {walk.timeline.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-dashed border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
              Sua história começa agora. Marque um capítulo como lido, registre uma oração ou uma gratidão — e
              cada acontecimento real aparecerá aqui.
            </p>
          ) : (
            <ol className="mt-4 space-y-6">
              {walk.timeline.slice(0, 60).map((day) => (
                <li key={day.date}>
                  <div className="text-xs font-semibold uppercase tracking-widest text-gold">
                    {formatDayPt(day.date)}
                  </div>
                  <ul className="mt-2 space-y-2 border-l border-border pl-4">
                    {day.events.map((e) => (
                      <li key={e.id} className="flex items-start gap-2 text-sm text-foreground">
                        <span aria-hidden className="mt-px">
                          {e.icon || CATEGORY_META[e.category].emoji}
                        </span>
                        <span>
                          {e.title}
                          {e.detail && (
                            <span className="block text-xs text-muted-foreground">{e.detail}</span>
                          )}
                          <span className="sr-only"> ({CATEGORY_META[e.category].label})</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="animate-fade-up rounded-3xl border border-border bg-secondary/40 p-6 motion-reduce:animate-none">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-gold">
            <Sparkles className="size-3.5" /> Como a caminhada cresce
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Nada aqui é inventado: nível, XP, sequência e progresso vêm das suas Jornadas e da sua leitura na
            Bíblia. Conquistas e itens só são desbloqueados quando o requisito realmente acontece.
          </p>
        </section>
      </main>

      <UnlockDialog item={selected} onOpenChange={(o) => !o && setSelected(null)} />
      <CelebrationDialog items={walk.celebration} onClose={walk.dismissCelebration} />
      <BottomNav />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/40 p-3">
      <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className={`mt-1 font-serif text-base tabular-nums ${accent ? "text-gold" : "text-foreground"}`}>
        {value}
      </dd>
    </div>
  );
}